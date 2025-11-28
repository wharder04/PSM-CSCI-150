import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { projectService, taskService } from "../../../services/api";
import { MdAdd, MdArrowBack, MdClose } from "react-icons/md";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [createTaskError, setCreateTaskError] = useState(null);

  // Form state
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    desc: "",
    priority: "Low",
    dueDate: "",
    assignee: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project details
        const projectResponse = await projectService.getProject(projectId);
        if (projectResponse && projectResponse.success) {
          setProject(projectResponse.data);
        } else {
          setError("Failed to load project");
          return;
        }

        // Fetch tasks
        const tasksResponse = await taskService.listTasks(projectId);
        if (tasksResponse && tasksResponse.ok) {
          setTasks(tasksResponse.data || []);
        }

        // Fetch project members for assignee dropdown
        const membersResponse = await projectService.listMembers(projectId);
        if (membersResponse && membersResponse.success) {
          setMembers(membersResponse.data || []);
        }
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to load project details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    assigned: tasks.filter((t) => t.assignee).length,
    incomplete: tasks.filter((t) => t.status !== "Completed").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    overdue: tasks.filter((t) => {
      if (!t.dueDate || t.status === "Completed") return false;
      return new Date(t.dueDate) < new Date();
    }).length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-text-secondary";
    }
  };

  const fetchTasks = async () => {
    try {
      const tasksResponse = await taskService.listTasks(projectId);
      if (tasksResponse && tasksResponse.ok) {
        setTasks(tasksResponse.data || []);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateTaskError(null);

    // Validation
    if (!taskFormData.title.trim()) {
      setCreateTaskError("Task title is required");
      return;
    }

    setCreateTaskLoading(true);
    try {
      const payload = {
        title: taskFormData.title.trim(),
        desc: taskFormData.desc.trim() || undefined,
        priority: taskFormData.priority,
        dueDate: taskFormData.dueDate
          ? new Date(taskFormData.dueDate).toISOString()
          : undefined,
        assignee: taskFormData.assignee || undefined,
      };

      const response = await taskService.createTask(projectId, payload);

      if (response && response.ok) {
        // Reset form
        setTaskFormData({
          title: "",
          desc: "",
          priority: "Low",
          dueDate: "",
          assignee: "",
        });
        setIsCreateTaskModalOpen(false);
        setCreateTaskError(null);

        // Refresh tasks list
        fetchTasks();
      } else {
        setCreateTaskError(response?.error || "Failed to create task");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setCreateTaskError(
        err.response?.data?.error ||
          err.message ||
          "Failed to create task. Please try again."
      );
    } finally {
      setCreateTaskLoading(false);
    }
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseTaskModal = () => {
    setIsCreateTaskModalOpen(false);
    setTaskFormData({
      title: "",
      desc: "",
      priority: "Low",
      dueDate: "",
      assignee: "",
    });
    setCreateTaskError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full p-8 bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-dark mb-4"></div>
          <p className="text-sm text-text-secondary">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen w-full p-8 bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Error loading project
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            {error || "Project not found"}
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="px-4 py-2 bg-accent-dark text-white rounded-lg text-sm font-medium hover:bg-accent-mid transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-2 bg-bg-base">
      <div className="mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/projects")}
          className="mb-6 flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <MdArrowBack size={20} />
          <span className="text-sm font-medium">Back to Projects</span>
        </button>

        {/* Project Title */}
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          {project.name}
        </h1>

        {/* Project Description */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Project Description
          </h2>
          <p className="text-base text-text-secondary">
            {project.desc || "No description provided"}
          </p>
        </div>

        {/* Task Statistics Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-200 rounded-xl p-4 border shadow-soft">
            <div className="text-sm text-text-secondary mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-text-primary">
              {taskStats.total}
            </div>
          </div>
          <div className="bg-gray-200 rounded-xl p-4 border shadow-soft">
            <div className="text-sm text-text-secondary mb-1">
              Assigned Tasks
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {taskStats.assigned}
            </div>
          </div>
          <div className="bg-gray-200 rounded-xl p-4 border shadow-soft">
            <div className="text-sm text-text-secondary mb-1">
              Incomplete Tasks
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {taskStats.incomplete}
            </div>
          </div>
          <div className="bg-gray-200 rounded-xl p-4 border shadow-soft">
            <div className="text-sm text-text-secondary mb-1">
              Completed Tasks
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {taskStats.completed}
            </div>
          </div>
          <div className="bg-gray-200 rounded-xl p-4 border shadow-soft">
            <div className="text-sm text-text-secondary mb-1">
              Overdue Tasks
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {taskStats.overdue}
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <h2 className="text-xl font-bold text-text-primary mb-4">Tasks</h2>
        <div className="bg-panel rounded-lg border border-border shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-panel-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Assigned to
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Date Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="hover:bg-panel-muted transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium hover:text-blue-500 hover:underline">
                      <Link to={`/tasks${task._id}`}>
                        {task.title || task.name || "Untitled Task"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {task.assignedTo || task.assignee?.name || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {task.assignee?.name || task.assignee?.email || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {task.dateAssigned
                        ? formatDate(task.dateAssigned)
                        : task.createdAt
                        ? formatDate(task.createdAt)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {task.status || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-text-muted text-sm">
                      No tasks found. Create your first task to get started.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Teams Table - Show below tasks table */}
        <h2 className="text-xl font-bold text-text-primary mb-4 mt-8">
          Team Members
        </h2>
        <div className="bg-panel rounded-lg border border-border shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-panel-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.length > 0 ? (
                members.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-panel-muted transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">
                      {member.memberId?.name || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {member.memberId?.email || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {member.addDate
                        ? formatDate(member.addDate)
                        : member.createdAt
                        ? formatDate(member.createdAt)
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="text-text-muted text-sm">
                      No team members found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="fixed bottom-8 right-8 flex items-center gap-2.5 px-6 py-4 bg-black cursor-pointer text-white rounded-2xl text-sm font-semibold shadow-large hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 z-50"
        >
          <MdAdd size={24} />
          <span>New Task</span>
        </button>
        {/* Create Task Modal */}
        {isCreateTaskModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 cursor-pointer"
            onClick={handleCloseTaskModal}
          >
            <div
              className="bg-panel rounded-xl shadow-large w-full max-w-xl h-full max-h-[90vh] overflow-y-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 rounded-tl-xl bg-panel px-6 py-5 flex justify-between items-center bg-white">
                <h2 className="text-xl font-semibold text-text-primary">
                  Create New Task
                </h2>
                <button
                  onClick={handleCloseTaskModal}
                  className="text-text-muted hover:text-text-primary transition-colors p-1"
                >
                  <MdClose size={20} />
                </button>
              </div>

              <form
                onSubmit={handleCreateTask}
                className="p-6 space-y-6 bg-white h-full overflow-y-none"
              >
                {createTaskError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {createTaskError}
                  </div>
                )}

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={taskFormData.title}
                    onChange={handleTaskInputChange}
                    required
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors"
                    placeholder="Enter task title"
                    disabled={createTaskLoading}
                  />
                </div>

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="desc"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="desc"
                    name="desc"
                    value={taskFormData.desc}
                    onChange={handleTaskInputChange}
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors resize-none"
                    placeholder="Enter task description"
                    disabled={createTaskLoading}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={taskFormData.priority}
                    onChange={handleTaskInputChange}
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border text-sm text-text-primary focus:outline-none focus:border-accent-dark transition-colors"
                    disabled={createTaskLoading}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={taskFormData.dueDate}
                    onChange={handleTaskInputChange}
                    className="col-span-4 px-0 py-2 bg-transparent border-0 border-b-2 border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors [color-scheme:light]"
                    disabled={createTaskLoading}
                  />
                </div>

                {members.length > 0 && (
                  <div className="grid grid-cols-5 items-center">
                    <label
                      htmlFor="assignee"
                      className="block text-sm font-medium text-text-primary mb-1"
                    >
                      Assignee
                    </label>
                    <select
                      id="assignee"
                      name="assignee"
                      value={taskFormData.assignee}
                      onChange={handleTaskInputChange}
                      className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border text-sm text-text-primary focus:outline-none focus:border-accent-dark transition-colors"
                      disabled={createTaskLoading}
                    >
                      <option value="">Unassigned</option>
                      {members.map((member) => (
                        <option
                          key={member.memberId._id}
                          value={member.memberId._id}
                        >
                          {member.memberId.name || member.memberId.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseTaskModal}
                    disabled={createTaskLoading}
                    className="flex-1 px-4 py-2.5 bg-panel-muted text-text-primary rounded-lg text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createTaskLoading || !taskFormData.title.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {createTaskLoading ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
