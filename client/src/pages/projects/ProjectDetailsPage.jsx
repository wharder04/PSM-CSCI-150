import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { projectService, taskService } from "../../../services/api";
import {
  MdAdd,
  MdArrowBack,
  MdClose,
  MdEdit,
  MdDelete,
  MdToggleOn,
  MdToggleOff,
} from "react-icons/md";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [createTaskError, setCreateTaskError] = useState(null);

  // Edit task state
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskLoading, setEditTaskLoading] = useState(false);
  const [editTaskError, setEditTaskError] = useState(null);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTaskLoading, setDeleteTaskLoading] = useState(false);

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");

  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [removeMemberLoading, setRemoveMemberLoading] = useState(false);
  const [memberActionError, setMemberActionError] = useState(null);
  const [togglingMemberId, setTogglingMemberId] = useState(null);

  // Edit and Delete Project state
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [editProjectLoading, setEditProjectLoading] = useState(false);
  const [deleteProjectLoading, setDeleteProjectLoading] = useState(false);
  const [editProjectError, setEditProjectError] = useState(null);
  const [deleteProjectError, setDeleteProjectError] = useState(null);

  const [projectFormData, setProjectFormData] = useState({
    name: "",
    desc: "",
    dueDate: "",
  });

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    desc: "",
    priority: "Low",
    dueDate: "",
    assignedTo: "",
    status: "UnAssigned",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectResponse = await projectService.getProject(projectId);
        if (projectResponse && projectResponse.success) {
          setProject(projectResponse.data);
          const projectData = projectResponse.data;
          setProjectFormData({
            name: projectData.name || "",
            desc: projectData.desc || "",
            dueDate: projectData.dueDate
              ? new Date(projectData.dueDate).toISOString().split("T")[0]
              : "",
          });
        } else {
          setError("Failed to load project");
          return;
        }

        const tasksResponse = await taskService.listTasks(projectId);
        if (tasksResponse && tasksResponse.success) {
          setTasks(tasksResponse.data || []);
        }

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

  const taskStats = {
    total: tasks.length,
    assigned: tasks.filter((t) => t.assignedTo && t.assignedTo._id).length,
    incomplete: tasks.filter((t) => t.status !== "Completed").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    overdue: tasks.filter((t) => {
      if (!t.dueDate || t.status === "Completed") return false;
      return new Date(t.dueDate) < new Date();
    }).length,
  };

  const isProjectOwner = () => {
    if (!project || !user) return false;
    const ownerId = project.ownerId?._id || project.ownerId;
    const userId = user._id;
    return ownerId?.toString() === userId?.toString();
  };

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setProjectFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenEditProjectModal = () => {
    if (project) {
      setProjectFormData({
        name: project.name || "",
        desc: project.desc || "",
        dueDate: project.dueDate
          ? new Date(project.dueDate).toISOString().split("T")[0]
          : "",
      });
    }
    setIsEditProjectModalOpen(true);
    setEditProjectError(null);
  };

  const handleCloseEditProjectModal = () => {
    setIsEditProjectModalOpen(false);
    setEditProjectError(null);
    if (project) {
      setProjectFormData({
        name: project.name || "",
        desc: project.desc || "",
        dueDate: project.dueDate
          ? new Date(project.dueDate).toISOString().split("T")[0]
          : "",
      });
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setEditProjectLoading(true);
    setEditProjectError(null);

    try {
      if (!projectFormData.name || !projectFormData.name.trim()) {
        setEditProjectError("Project name is required");
        setEditProjectLoading(false);
        return;
      }

      const updateData = {
        name: projectFormData.name.trim(),
        desc: projectFormData.desc || "",
        dueDate: projectFormData.dueDate || null,
      };

      const response = await projectService.updateProject(projectId, updateData);
      if (response && response.success) {
        setProject(response.data);
        setIsEditProjectModalOpen(false);
      } else {
        setEditProjectError(response?.error || "Failed to update project");
      }
    } catch (err) {
      console.error("Error updating project:", err);
      setEditProjectError(
        err.response?.data?.error ||
        err.message ||
        "Failed to update project. Please try again."
      );
    } finally {
      setEditProjectLoading(false);
    }
  };

  const handleOpenDeleteProjectModal = () => {
    setIsDeleteProjectModalOpen(true);
    setDeleteProjectError(null);
  };

  const handleCloseDeleteProjectModal = () => {
    setIsDeleteProjectModalOpen(false);
    setDeleteProjectError(null);
  };

  const handleDeleteProject = async () => {
    setDeleteProjectLoading(true);
    setDeleteProjectError(null);

    try {
      const response = await projectService.deleteProject(projectId);
      if (response && response.success) {
        navigate("/projects");
      } else {
        setDeleteProjectError(response?.error || "Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      setDeleteProjectError(
        err.response?.data?.error ||
        err.message ||
        "Failed to delete project. Please try again."
      );
    } finally {
      setDeleteProjectLoading(false);
    }
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
    return `${months[date.getMonth()]
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

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
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
        assignedTo: taskFormData.assignedTo || undefined,
      };

      const response = await taskService.createTask(projectId, payload);

      if (response && response.success) {
        setTasks([...tasks, response.data]);

        setTaskFormData({
          title: "",
          desc: "",
          priority: "Low",
          dueDate: "",
          assignedTo: "",
          status: "UnAssigned",
        });
        setIsCreateTaskModalOpen(false);
        setCreateTaskError(null);
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
      assignedTo: "",
      status: "UnAssigned",
    });
    setCreateTaskError(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    const dueDate = task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "";
    setTaskFormData({
      title: task.title || "",
      desc: task.desc || "",
      priority: task.priority || "Low",
      dueDate: dueDate,
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      status: task.status || "UnAssigned",
    });
    setIsEditTaskModalOpen(true);
    setEditTaskError(null);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setEditTaskError(null);

    if (!taskFormData.title.trim()) {
      setEditTaskError("Task title is required");
      return;
    }

    setEditTaskLoading(true);
    try {
      const payload = {
        title: taskFormData.title.trim(),
        desc: taskFormData.desc.trim() || undefined,
        priority: taskFormData.priority,
        dueDate: taskFormData.dueDate
          ? new Date(taskFormData.dueDate).toISOString()
          : undefined,
        assignedTo: taskFormData.assignedTo || undefined,
        status: taskFormData.status,
      };

      const response = await taskService.updateTask(editingTask._id, payload);

      if (response && response.success) {
        setTasks(
          tasks.map((t) => (t._id === editingTask._id ? response.data : t))
        );

        setTaskFormData({
          title: "",
          desc: "",
          priority: "Low",
          dueDate: "",
          assignedTo: "",
          status: "UnAssigned",
        });
        setEditingTask(null);
        setIsEditTaskModalOpen(false);
        setEditTaskError(null);
      } else {
        setEditTaskError(response?.error || "Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setEditTaskError(
        err.response?.data?.error ||
        err.message ||
        "Failed to update task. Please try again."
      );
    } finally {
      setEditTaskLoading(false);
    }
  };

  const handleCloseEditTaskModal = () => {
    setIsEditTaskModalOpen(false);
    setEditingTask(null);
    setTaskFormData({
      title: "",
      desc: "",
      priority: "Low",
      dueDate: "",
      assignedTo: "",
      status: "UnAssigned",
    });
    setEditTaskError(null);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    setDeleteTaskLoading(true);
    try {
      const response = await taskService.deleteTask(taskToDelete._id);

      if (response && response.success) {
        setTasks(tasks.filter((t) => t._id !== taskToDelete._id));
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
      } else {
        setEditTaskError(response?.error || "Failed to delete task");
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      setEditTaskError(
        err.response?.data?.error ||
        err.message ||
        "Failed to delete task. Please try again."
      );
      setIsDeleteModalOpen(false);
    } finally {
      setDeleteTaskLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddMemberError(null);

    if (!memberEmail.trim()) {
      setAddMemberError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberEmail.trim())) {
      setAddMemberError("Please enter a valid email address");
      return;
    }

    setAddMemberLoading(true);
    try {
      const response = await projectService.addMember(
        projectId,
        memberEmail.trim()
      );

      if (response && response.success) {
        const membersResponse = await projectService.listMembers(projectId);
        if (membersResponse && membersResponse.success) {
          setMembers(membersResponse.data || []);
        }

        setMemberEmail("");
        setIsAddMemberModalOpen(false);
        setAddMemberError(null);
      } else {
        setAddMemberError(response?.error || "Failed to add member");
      }
    } catch (err) {
      console.error("Error adding member:", err);
      setAddMemberError(
        err.response?.data?.error ||
        err.message ||
        "Failed to add member. Please try again."
      );
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleCloseAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
    setMemberEmail("");
    setAddMemberError(null);
  };

  const handleToggleMemberStatus = async (memberId) => {
    setTogglingMemberId(memberId);
    setMemberActionError(null);
    try {
      const response = await projectService.toggleMemberStatus(
        projectId,
        memberId
      );

      if (response && response.success) {
        const updatedMember = response.data;
        setMembers(
          members.map((m) =>
            (m.memberId._id === memberId ||
              m.memberId._id.toString() === memberId.toString()) &&
              (m._id === updatedMember._id ||
                m._id.toString() === updatedMember._id.toString())
              ? updatedMember
              : m
          )
        );
      } else {
        setMemberActionError(
          response?.error || "Failed to toggle member status"
        );
      }
    } catch (err) {
      console.error("Error toggling member status:", err);
      setMemberActionError(
        err.response?.data?.error ||
        err.message ||
        "Failed to toggle member status. Please try again."
      );
    } finally {
      setTogglingMemberId(null);
    }
  };

  const handleRemoveMemberClick = (member) => {
    setMemberToRemove(member);
    setIsRemoveMemberModalOpen(true);
    setMemberActionError(null);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setRemoveMemberLoading(true);
    try {
      const memberId = memberToRemove.memberId._id || memberToRemove.memberId;
      const response = await projectService.removeMember(projectId, memberId);

      if (response && response.success) {
        setMembers(
          members.filter(
            (m) =>
              m.memberId._id !== memberId &&
              m.memberId._id.toString() !== memberId.toString()
          )
        );
        setIsRemoveMemberModalOpen(false);
        setMemberToRemove(null);
      } else {
        setMemberActionError(response?.error || "Failed to remove member");
        setIsRemoveMemberModalOpen(false);
      }
    } catch (err) {
      console.error("Error removing member:", err);
      setMemberActionError(
        err.response?.data?.error ||
        err.message ||
        "Failed to remove member. Please try again."
      );
      setIsRemoveMemberModalOpen(false);
    } finally {
      setRemoveMemberLoading(false);
    }
  };

  const handleCloseRemoveMemberModal = () => {
    setIsRemoveMemberModalOpen(false);
    setMemberToRemove(null);
    setMemberActionError(null);
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-9/10 p-2 bg-bg-base">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-text-primary">
            {project.name}
          </h1>
          {isProjectOwner() && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenEditProjectModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <MdEdit size={18} />
                <span>Edit Project</span>
              </button>
              <button
                onClick={handleOpenDeleteProjectModal}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
              >
                <MdDelete size={18} />
                <span>Delete Project</span>
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <p className="text-base text-text-secondary">
            {project.desc || "No description provided"}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-8 w-3/4">
          <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-soft">
            <div className="text-sm text-text-secondary mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-text-primary">
              {taskStats.total}
            </div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-soft">
            <div className="text-sm text-text-secondary mb-1">
              Assigned Tasks
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {taskStats.assigned}
            </div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-soft">
            <div className="text-sm text-text-secondary mb-1">
              Incomplete Tasks
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {taskStats.incomplete}
            </div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-soft">
            <div className="text-sm text-text-secondary mb-1">
              Completed Tasks
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {taskStats.completed}
            </div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-soft">
            <div className="text-sm text-text-secondary mb-1">
              Overdue Tasks
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {taskStats.overdue}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 mt-8">
          <h2 className="text-xl font-bold text-text-primary">Tasks</h2>
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <MdAdd size={20} />
            <span>New Task</span>
          </button>
        </div>
        <div className="bg-panel rounded-lg border border-gray-200 shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-panel-muted border-b border-gray-200">
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
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Date Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Actions
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
                    <td className="px-6 py-4 text-sm text-text-primary font-medium">
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="hover:text-blue-500 hover:underline font-bold text-md"
                        >
                          {task.title || task.name || "Untitled Task"}
                        </Link>
                        {task.desc && (
                          <span className="text-sm text-text-secondary">
                            {task.desc}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {task.assignedTo?.name || task.assignedTo?.email ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                            {getInitials(
                              task.assignedTo?.name || task.assignedTo?.email
                            )}
                          </span>
                          <span>
                            {task.assignedTo?.name || task.assignedTo?.email}
                          </span>
                        </div>
                      ) : (
                        "Unassigned"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {task.assignee?.name || task.assignee?.email ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                            {getInitials(
                              task.assignee?.name || task.assignee?.email
                            )}
                          </span>
                          <span>
                            {task.assignee?.name || task.assignee?.email}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {task.dueDate ? formatDate(task.dueDate) : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {task.dateAssigned
                        ? formatDate(task.dateAssigned)
                        : task.createdAt
                          ? formatDate(task.createdAt)
                          : "—"}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {task.status || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary flex items-center gap-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                        title="Edit task"
                      >
                        <MdEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <MdDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-text-muted text-sm">
                      No tasks found. Create your first task to get started.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mb-4 mt-8">
          <h2 className="text-xl font-bold text-text-primary">Team Members</h2>
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <MdAdd size={20} />
            <span>Add Member</span>
          </button>
        </div>

        <div className="bg-panel rounded-lg border border-gray-200 shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-panel-muted border-b border-gray-200">
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Actions
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
                        className={`px-2 py-1 rounded-full text-xs font-medium ${member.isActive
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleToggleMemberStatus(member.memberId._id)
                        }
                        disabled={togglingMemberId === member.memberId._id}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                        title={
                          member.isActive
                            ? "Deactivate member"
                            : "Activate member"
                        }
                      >
                        {togglingMemberId === member.memberId._id ? (
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : member.isActive ? (
                          <>
                            <MdToggleOn size={18} />
                            <span className="text-xs">Deactivate</span>
                          </>
                        ) : (
                          <>
                            <MdToggleOff size={18} />
                            <span className="text-xs">Activate</span>
                          </>
                        )}
                      </button>
                      {isProjectOwner() && (
                        <button
                          onClick={() => handleRemoveMemberClick(member)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Remove member"
                        >
                          <MdDelete size={18} />
                          <span className="text-xs">Remove</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-text-muted text-sm">
                      No team members found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
                  className="text-text-muted hover:text-text-primary transition-colors p-1 cursor-pointer"
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
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors"
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
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors resize-none"
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
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary focus:outline-none focus:border-accent-dark transition-colors"
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
                    className="col-span-4 px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors [color-scheme:light]"
                    disabled={createTaskLoading}
                  />
                </div>

                {members.length > 0 && (
                  <div className="grid grid-cols-5 items-center">
                    <label
                      htmlFor="assignedTo"
                      className="block text-sm font-medium text-text-primary mb-1"
                    >
                      Assignee
                    </label>
                    <select
                      id="assignedTo"
                      name="assignedTo"
                      value={taskFormData.assignedTo}
                      onChange={handleTaskInputChange}
                      className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary focus:outline-none focus:border-accent-dark transition-colors"
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
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createTaskLoading || !taskFormData.title.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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

        {isEditTaskModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 cursor-pointer"
            onClick={handleCloseEditTaskModal}
          >
            <div
              className="bg-panel rounded-xl shadow-large w-full max-w-xl h-full max-h-[90vh] overflow-y-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 rounded-tl-xl bg-panel px-6 py-5 flex justify-between items-center bg-white">
                <h2 className="text-xl font-semibold text-text-primary">
                  Edit Task
                </h2>
                <button
                  onClick={handleCloseEditTaskModal}
                  className="text-text-muted hover:text-text-primary transition-colors p-1 cursor-pointer"
                >
                  <MdClose size={20} />
                </button>
              </div>

              <form
                onSubmit={handleUpdateTask}
                className="p-6 space-y-6 bg-white h-full overflow-y-none"
              >
                {editTaskError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {editTaskError}
                  </div>
                )}

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="edit-title"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={taskFormData.title}
                    onChange={handleTaskInputChange}
                    required
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors"
                    placeholder="Enter task title"
                    disabled={editTaskLoading}
                  />
                </div>

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="edit-desc"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-desc"
                    name="desc"
                    value={taskFormData.desc}
                    onChange={handleTaskInputChange}
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors resize-none"
                    placeholder="Enter task description"
                    disabled={editTaskLoading}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="edit-priority"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Priority
                  </label>
                  <select
                    id="edit-priority"
                    name="priority"
                    value={taskFormData.priority}
                    onChange={handleTaskInputChange}
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary focus:outline-none focus:border-accent-dark transition-colors"
                    disabled={editTaskLoading}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="edit-dueDate"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="edit-dueDate"
                    name="dueDate"
                    value={taskFormData.dueDate}
                    onChange={handleTaskInputChange}
                    className="col-span-4 px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors [color-scheme:light]"
                    disabled={editTaskLoading}
                  />
                </div>

                {members.length > 0 && (
                  <div className="grid grid-cols-5 items-center">
                    <label
                      htmlFor="edit-assignedTo"
                      className="block text-sm font-medium text-text-primary mb-1"
                    >
                      Assignee
                    </label>
                    <select
                      id="edit-assignedTo"
                      name="assignedTo"
                      value={taskFormData.assignedTo}
                      onChange={handleTaskInputChange}
                      className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary focus:outline-none focus:border-accent-dark transition-colors"
                      disabled={editTaskLoading}
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

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="edit-status"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="edit-status"
                    name="status"
                    value={taskFormData.status}
                    onChange={handleTaskInputChange}
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary focus:outline-none focus:border-accent-dark transition-colors"
                    disabled={editTaskLoading}
                  >
                    <option value="UnAssigned">UnAssigned</option>
                    <option value="Assigned">Assigned</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Testing">Testing</option>
                    <option value="Completed">Completed</option>
                    <option value="InComplete">InComplete</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseEditTaskModal}
                    disabled={editTaskLoading}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editTaskLoading || !taskFormData.title.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {editTaskLoading ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && taskToDelete && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleCloseDeleteModal}
          >
            <div
              className="bg-white rounded-xl shadow-large w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Delete Task
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                Are you sure you want to delete the task "
                {taskToDelete.title || taskToDelete.name || "Untitled Task"}"?
                This action cannot be undone.
              </p>
              {editTaskError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {editTaskError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  disabled={deleteTaskLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  disabled={deleteTaskLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deleteTaskLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isAddMemberModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleCloseAddMemberModal}
          >
            <div
              className="bg-white rounded-xl shadow-large w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                  Add Team Member
                </h2>
                <button
                  onClick={handleCloseAddMemberModal}
                  className="text-text-muted hover:text-text-primary transition-colors p-1 cursor-pointer"
                >
                  <MdClose size={20} />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-6">
                {addMemberError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {addMemberError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="memberEmail"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="memberEmail"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-transparent border-2 border-gray-200 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="Enter member's email address"
                    disabled={addMemberLoading}
                  />
                  <p className="mt-2 text-xs text-text-secondary">
                    Enter the email address of the user you want to add to this
                    project.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseAddMemberModal}
                    disabled={addMemberLoading}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addMemberLoading || !memberEmail.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {addMemberLoading ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      "Add Member"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isRemoveMemberModalOpen && memberToRemove && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleCloseRemoveMemberModal}
          >
            <div
              className="bg-white rounded-xl shadow-large w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Remove Team Member
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                Are you sure you want to remove{" "}
                <span className="font-semibold">
                  {memberToRemove.memberId?.name ||
                    memberToRemove.memberId?.email ||
                    "this member"}
                </span>{" "}
                from this project? This action cannot be undone.
              </p>
              {memberActionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {memberActionError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseRemoveMemberModal}
                  disabled={removeMemberLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRemoveMember}
                  disabled={removeMemberLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {removeMemberLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Removing...</span>
                    </>
                  ) : (
                    "Remove"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {isEditProjectModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 cursor-pointer"
            onClick={handleCloseEditProjectModal}
          >
            <div
              className="bg-panel rounded-xl shadow-large w-full max-w-xl h-full max-h-[90vh] overflow-y-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 rounded-tl-xl bg-panel px-6 py-5 flex justify-between items-center bg-white">
                <h2 className="text-xl font-semibold text-text-primary">
                  Edit Project
                </h2>
                <button
                  onClick={handleCloseEditProjectModal}
                  className="text-text-muted hover:text-text-primary transition-colors p-1 cursor-pointer"
                >
                  <MdClose size={20} />
                </button>
              </div>

              <form
                onSubmit={handleUpdateProject}
                className="p-6 space-y-6 bg-white h-full overflow-y-none"
              >
                {editProjectError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {editProjectError}
                  </div>
                )}

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="project-name"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="project-name"
                    name="name"
                    value={projectFormData.name}
                    onChange={handleProjectInputChange}
                    required
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors"
                    placeholder="Enter project name"
                    disabled={editProjectLoading}
                  />
                </div>

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="project-desc"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="project-desc"
                    name="desc"
                    value={projectFormData.desc}
                    onChange={handleProjectInputChange}
                    className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors resize-none"
                    placeholder="Enter project description"
                    disabled={editProjectLoading}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-5 items-center">
                  <label
                    htmlFor="project-dueDate"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="project-dueDate"
                    name="dueDate"
                    value={projectFormData.dueDate}
                    onChange={handleProjectInputChange}
                    className="col-span-4 px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors [color-scheme:light]"
                    disabled={editProjectLoading}
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseEditProjectModal}
                    disabled={editProjectLoading}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editProjectLoading || !projectFormData.name.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {editProjectLoading ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Project Modal */}
        {isDeleteProjectModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleCloseDeleteProjectModal}
          >
            <div
              className="bg-white rounded-xl shadow-large w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Delete Project
              </h2>
              {deleteProjectError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {deleteProjectError}
                </div>
              )}

              <div className="space-y-4">
                <p className="text-sm text-text-primary">
                  Are you sure you want to delete the project "
                  <span className="font-semibold">{project?.name}</span>"?
                </p>
                <p className="text-sm text-text-secondary">
                  This action will permanently delete the project, all its tasks, and remove all team members. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleCloseDeleteProjectModal}
                  disabled={deleteProjectLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  disabled={deleteProjectLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deleteProjectLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>

        )}
      </div>
    </div>
  );
}
