import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { projectService, taskService } from "../../../services/api";
import { MdAdd, MdClose, MdEdit, MdDelete, MdToggleOn, MdToggleOff } from "react-icons/md";

export default function ProjectDetailsPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sort state (NEW)
    const [taskSort, setTaskSort] = useState("dueDateAsc");

    // Create task modal state
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [createTaskLoading, setCreateTaskLoading] = useState(false);
    const [createTaskError, setCreateTaskError] = useState(null);

    // Edit task state
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editTaskLoading, setEditTaskLoading] = useState(false);
    const [editTaskError, setEditTaskError] = useState(null);

    // Delete task state
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTaskLoading, setDeleteTaskLoading] = useState(false);

    // Add member state
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [addMemberLoading, setAddMemberLoading] = useState(false);
    const [addMemberError, setAddMemberError] = useState(null);
    const [memberEmail, setMemberEmail] = useState("");

    // Remove/toggle member state
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
    const [removeMemberLoading, setRemoveMemberLoading] = useState(false);
    const [memberActionError, setMemberActionError] = useState(null);
    const [togglingMemberId, setTogglingMemberId] = useState(null);

    // Edit/Delete Project state
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
    const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
    const [editProjectLoading, setEditProjectLoading] = useState(false);
    const [deleteProjectLoading, setDeleteProjectLoading] = useState(false);
    const [editProjectError, setEditProjectError] = useState(null);
    const [deleteProjectError, setDeleteProjectError] = useState(null);

    const [projectFormData, setProjectFormData] = useState({ name: "", desc: "", dueDate: "" });

    // Task form data (Create + Edit)
    const [taskFormData, setTaskFormData] = useState({
        title: "",
        desc: "",
        priority: "Low",
        dueDate: "",
        assignedTo: "",
        status: "UnAssigned",
    });

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High": return "text-red-600";
            case "Medium": return "text-yellow-600";
            case "Low": return "text-green-600";
            default: return "text-gray-700";
        }
    };

    const getInitials = (name) => {
        if (!name) return "";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const isProjectOwner = () => {
        if (!project || !user) return false;
        const ownerId = project.ownerId?._id || project.ownerId;
        const userId = user._id;
        return ownerId?.toString() === userId?.toString();
    };

    const fetchTasks = async () => {
        try {
            const tasksResponse = await taskService.listTasks(projectId);
            if (tasksResponse?.success) setTasks(tasksResponse.data || []);
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    };

    const fetchMembers = async () => {
        try {
            const membersResponse = await projectService.listMembers(projectId);
            if (membersResponse?.success) setMembers(membersResponse.data || []);
        } catch (err) {
            console.error("Error fetching members:", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const projectResponse = await projectService.getProject(projectId);
                if (projectResponse?.success) {
                    setProject(projectResponse.data);
                    const p = projectResponse.data;

                    setProjectFormData({
                        name: p.name || "",
                        desc: p.desc || "",
                        dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split("T")[0] : "",
                    });
                } else {
                    setError("Failed to load project");
                    return;
                }

                await Promise.all([fetchTasks(), fetchMembers()]);
            } catch (err) {
                console.error("Error fetching project details:", err);
                setError("Failed to load project details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (projectId) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // Summary counts (top cards)
    const taskStats = useMemo(() => {
        const now = new Date();

        const total = tasks.length;
        const assigned = tasks.filter((t) => t.status === "Assigned").length;
        const incomplete = tasks.filter((t) => t.status === "InComplete").length;
        const completed = tasks.filter((t) => t.status === "Completed").length;
        const overdue = tasks.filter((t) => {
            if (!t.dueDate) return false;
            if (t.status === "Completed") return false;
            return new Date(t.dueDate) < now;
        }).length;

        return { total, assigned, incomplete, completed, overdue };
    }, [tasks]);

    // NEW: Sorted tasks for the table
    const sortedTasks = useMemo(() => {
        const list = [...tasks];

        const byStr = (a, b) => (a || "").localeCompare(b || "");
        const byDate = (a, b) => {
            const da = a ? new Date(a).getTime() : Number.POSITIVE_INFINITY;
            const db = b ? new Date(b).getTime() : Number.POSITIVE_INFINITY;
            return da - db;
        };

        const priorityRank = (p) => (p === "High" ? 0 : p === "Medium" ? 1 : 2);

        list.sort((A, B) => {
            if (taskSort === "dueDateAsc") return byDate(A.dueDate, B.dueDate);
            if (taskSort === "dueDateDesc") return byDate(B.dueDate, A.dueDate);
            if (taskSort === "titleAsc") return byStr(A.title, B.title);
            if (taskSort === "titleDesc") return byStr(B.title, A.title);
            if (taskSort === "priorityHigh") return priorityRank(A.priority) - priorityRank(B.priority);
            if (taskSort === "priorityLow") return priorityRank(B.priority) - priorityRank(A.priority);
            if (taskSort === "statusAsc") return byStr(A.status, B.status);
            if (taskSort === "statusDesc") return byStr(B.status, A.status);
            return 0;
        });

        return list;
    }, [tasks, taskSort]);

    // NEW: Member stats (Assigned / Completed / % / Overdue)
    const memberStats = useMemo(() => {
        const now = new Date();
        const totalTasks = tasks.length || 1;

        const statsByUserId = new Map();

        const getAssignedUserId = (task) => task?.assignedTo?._id || task?.assignedTo || null;

        for (const t of tasks) {
            const uid = getAssignedUserId(t);
            if (!uid) continue;

            if (!statsByUserId.has(uid)) {
                statsByUserId.set(uid, { assigned: 0, completed: 0, overdue: 0 });
            }

            const s = statsByUserId.get(uid);
            s.assigned += 1;
            if (t.status === "Completed") s.completed += 1;

            if (t.dueDate && t.status !== "Completed" && new Date(t.dueDate) < now) {
                s.overdue += 1;
            }
        }

        // add percent
        for (const [uid, s] of statsByUserId.entries()) {
            s.percent = Math.round((s.assigned / totalTasks) * 100);
        }

        return statsByUserId;
    }, [tasks]);

    // ---------------- PROJECT EDIT/DELETE ----------------
    const handleProjectInputChange = (e) => {
        const { name, value } = e.target;
        setProjectFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenEditProjectModal = () => {
        if (project) {
            setProjectFormData({
                name: project.name || "",
                desc: project.desc || "",
                dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
            });
        }
        setIsEditProjectModalOpen(true);
        setEditProjectError(null);
    };

    const handleCloseEditProjectModal = () => {
        setIsEditProjectModalOpen(false);
        setEditProjectError(null);
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        setEditProjectLoading(true);
        setEditProjectError(null);

        try {
            if (!projectFormData.name?.trim()) {
                setEditProjectError("Project name is required");
                return;
            }

            const updateData = {
                name: projectFormData.name.trim(),
                desc: projectFormData.desc || "",
                dueDate: projectFormData.dueDate || null,
            };

            const response = await projectService.updateProject(projectId, updateData);
            if (response?.success) {
                setProject(response.data);
                setIsEditProjectModalOpen(false);
            } else {
                setEditProjectError(response?.error || "Failed to update project");
            }
        } catch (err) {
            console.error("Error updating project:", err);
            setEditProjectError(err.response?.data?.error || err.message || "Failed to update project.");
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
            if (response?.success) navigate("/projects");
            else setDeleteProjectError(response?.error || "Failed to delete project");
        } catch (err) {
            console.error("Error deleting project:", err);
            setDeleteProjectError(err.response?.data?.error || err.message || "Failed to delete project.");
        } finally {
            setDeleteProjectLoading(false);
        }
    };

    // ---------------- TASK CREATE/EDIT/DELETE ----------------
    const handleTaskInputChange = (e) => {
        const { name, value } = e.target;
        setTaskFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetTaskForm = () => {
        setTaskFormData({
            title: "",
            desc: "",
            priority: "Low",
            dueDate: "",
            assignedTo: "",
            status: "UnAssigned",
        });
    };

    const handleCloseTaskModal = () => {
        setIsCreateTaskModalOpen(false);
        resetTaskForm();
        setCreateTaskError(null);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setCreateTaskError(null);

        if (!taskFormData.title.trim()) return setCreateTaskError("Task title is required");
        if (!taskFormData.dueDate) return setCreateTaskError("Due date is required");

        setCreateTaskLoading(true);
        try {
            const payload = {
                title: taskFormData.title.trim(),
                desc: taskFormData.desc?.trim() || undefined,
                priority: taskFormData.priority,
                dueDate: taskFormData.dueDate ? new Date(taskFormData.dueDate).toISOString() : undefined,
                assignedTo: taskFormData.assignedTo || undefined,
                status: taskFormData.status || "UnAssigned",
            };

            const response = await taskService.createTask(projectId, payload);
            if (response?.success) {
                await fetchTasks();
                handleCloseTaskModal();
            } else {
                setCreateTaskError(response?.error || "Failed to create task");
            }
        } catch (err) {
            console.error("Error creating task:", err);
            setCreateTaskError(err.response?.data?.error || err.message || "Failed to create task.");
        } finally {
            setCreateTaskLoading(false);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        const dueDate = task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "";

        setTaskFormData({
            title: task.title || "",
            desc: task.desc || "",
            priority: task.priority || "Low",
            dueDate,
            assignedTo: task.assignedTo?._id || task.assignedTo || "",
            status: task.status || "UnAssigned",
        });

        setIsEditTaskModalOpen(true);
        setEditTaskError(null);
    };

    const handleCloseEditTaskModal = () => {
        setIsEditTaskModalOpen(false);
        setEditingTask(null);
        resetTaskForm();
        setEditTaskError(null);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        setEditTaskError(null);

        if (!taskFormData.title.trim()) return setEditTaskError("Task title is required");
        if (!taskFormData.dueDate) return setEditTaskError("Due date is required");

        setEditTaskLoading(true);
        try {
            const payload = {
                title: taskFormData.title.trim(),
                desc: taskFormData.desc?.trim() || undefined,
                priority: taskFormData.priority,
                dueDate: taskFormData.dueDate ? new Date(taskFormData.dueDate).toISOString() : undefined,
                assignedTo: taskFormData.assignedTo || undefined,
                status: taskFormData.status,
            };

            const response = await taskService.updateTask(editingTask._id, payload);
            if (response?.success) {
                await fetchTasks();
                handleCloseEditTaskModal();
            } else {
                setEditTaskError(response?.error || "Failed to update task");
            }
        } catch (err) {
            console.error("Error updating task:", err);
            setEditTaskError(err.response?.data?.error || err.message || "Failed to update task.");
        } finally {
            setEditTaskLoading(false);
        }
    };

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;

        setDeleteTaskLoading(true);
        try {
            const response = await taskService.deleteTask(taskToDelete._id);
            if (response?.success) {
                await fetchTasks();
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        } finally {
            setDeleteTaskLoading(false);
            handleCloseDeleteModal();
        }
    };

    // ---------------- MEMBERS ----------------
    const handleAddMember = async (e) => {
        e.preventDefault();
        setAddMemberError(null);

        if (!memberEmail.trim()) return setAddMemberError("Email is required");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(memberEmail.trim())) return setAddMemberError("Please enter a valid email address");

        setAddMemberLoading(true);
        try {
            const response = await projectService.addMember(projectId, memberEmail.trim());
            if (response?.success) {
                await fetchMembers();
                setMemberEmail("");
                setIsAddMemberModalOpen(false);
            } else {
                setAddMemberError(response?.error || "Failed to add member");
            }
        } catch (err) {
            console.error("Error adding member:", err);
            setAddMemberError(err.response?.data?.error || err.message || "Failed to add member.");
        } finally {
            setAddMemberLoading(false);
        }
    };

    const handleToggleMemberStatus = async (memberId) => {
        setTogglingMemberId(memberId);
        setMemberActionError(null);

        try {
            const response = await projectService.toggleMemberStatus(projectId, memberId);
            if (response?.success) await fetchMembers();
            else setMemberActionError(response?.error || "Failed to toggle member status");
        } catch (err) {
            console.error("Error toggling member status:", err);
            setMemberActionError(err.response?.data?.error || err.message || "Failed to toggle member status.");
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
            const memberId = memberToRemove.memberId?._id || memberToRemove.memberId;
            const response = await projectService.removeMember(projectId, memberId);
            if (response?.success) {
                await fetchMembers();
            } else {
                setMemberActionError(response?.error || "Failed to remove member");
            }
        } catch (err) {
            console.error("Error removing member:", err);
            setMemberActionError(err.response?.data?.error || err.message || "Failed to remove member.");
        } finally {
            setRemoveMemberLoading(false);
            setIsRemoveMemberModalOpen(false);
            setMemberToRemove(null);
        }
    };

    // ---------------- RENDER STATES ----------------
    if (loading) {
        return (
            <div className="min-h-screen w-full p-8 bg-bg-base flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-dark mb-4"></div>
                    <p className="text-sm text-text-secondary">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen w-full p-8 bg-bg-base flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Error loading project</h3>
                    <p className="text-sm text-text-secondary mb-4">{error || "Project not found"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-9/10 p-2 bg-bg-base">
            <div className="mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-4xl font-bold text-text-primary">{project.name}</h1>

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
                    <p className="text-base text-text-secondary">{project.desc || "No description provided"}</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-5 gap-4 mb-8 w-3/4">
                    <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-soft">
                        <div className="text-sm text-gray-700 mb-1">Total Tasks</div>
                        <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-soft">
                        <div className="text-sm text-gray-700 mb-1">Assigned Tasks</div>
                        <div className="text-2xl font-bold text-gray-900">{taskStats.assigned}</div>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-soft">
                        <div className="text-sm text-gray-700 mb-1">Incomplete Tasks</div>
                        <div className="text-2xl font-bold text-gray-900">{taskStats.incomplete}</div>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-soft">
                        <div className="text-sm text-gray-700 mb-1">Completed Tasks</div>
                        <div className="text-2xl font-bold text-gray-900">{taskStats.completed}</div>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-soft">
                        <div className="text-sm text-gray-700 mb-1">Overdue Tasks</div>
                        <div className="text-2xl font-bold text-gray-900">{taskStats.overdue}</div>
                    </div>
                </div>

                {/* TASKS HEADER + SORT */}
                <div className="flex justify-between items-center mb-4 mt-8">
                    <h2 className="text-xl font-bold text-text-primary">Tasks</h2>

                    <div className="flex items-center gap-3">
                        <select
                            value={taskSort}
                            onChange={(e) => setTaskSort(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm"
                            title="Sort tasks"
                        >
                            <option value="dueDateAsc">Due Date (Soonest)</option>
                            <option value="dueDateDesc">Due Date (Latest)</option>
                            <option value="titleAsc">Title (A → Z)</option>
                            <option value="titleDesc">Title (Z → A)</option>
                            <option value="priorityHigh">Priority (High → Low)</option>
                            <option value="priorityLow">Priority (Low → High)</option>
                            <option value="statusAsc">Status (A → Z)</option>
                            <option value="statusDesc">Status (Z → A)</option>
                        </select>

                        <button
                            onClick={() => {
                                resetTaskForm();
                                setIsCreateTaskModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            <MdAdd size={20} />
                            <span>New Task</span>
                        </button>
                    </div>
                </div>

                {/* TASKS TABLE */}
                <div className="bg-panel rounded-lg border border-gray-200 shadow-soft overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-panel-muted border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Assigned to</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Assignee</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Date Assigned</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {sortedTasks.length > 0 ? (
                                sortedTasks.map((task) => (
                                    <tr key={task._id} className="hover:bg-panel-muted transition-colors">
                                        <td className="px-6 py-4 text-sm text-text-primary font-medium">
                                            <div className="flex flex-col gap-2">
                                                <Link to={`/tasks/${task._id}`} className="hover:text-blue-500 hover:underline font-bold text-md">
                                                    {task.title || task.name || "Untitled Task"}
                                                </Link>
                                                {task.desc && <span className="text-sm text-text-secondary">{task.desc}</span>}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                            {task.assignedTo?.name || task.assignedTo?.email ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                                        {getInitials(task.assignedTo?.name || task.assignedTo?.email)}
                                                    </span>
                                                    <span>{task.assignedTo?.name || task.assignedTo?.email}</span>
                                                </div>
                                            ) : (
                                                "Unassigned"
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                            {task.assignee?.name || task.assignee?.email ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                                                        {getInitials(task.assignee?.name || task.assignee?.email)}
                                                    </span>
                                                    <span>{task.assignee?.name || task.assignee?.email}</span>
                                                </div>
                                            ) : (
                                                "—"
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                            {task.dueDate ? formatDate(task.dueDate) : "—"}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                            {task.dateAssigned ? formatDate(task.dateAssigned) : task.createdAt ? formatDate(task.createdAt) : "—"}
                                        </td>

                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPriorityColor(task.priority)}`}>
                                            {task.priority || "—"}
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
                                        <div className="text-text-muted text-sm">No tasks found. Create your first task to get started.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* TEAM MEMBERS HEADER */}
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

                {/* TEAM MEMBERS TABLE + NEW STATS COLUMNS */}
                <div className="bg-panel rounded-lg border border-gray-200 shadow-soft overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-panel-muted border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Assigned</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Completed</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">% of Project</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Overdue</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {members.length > 0 ? (
                                members.map((member) => {
                                    const uid = member.memberId?._id || member.memberId;
                                    const s = uid ? memberStats.get(uid) : null;

                                    return (
                                        <tr key={member._id} className="hover:bg-panel-muted transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">
                                                {member.memberId?.name || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                {member.memberId?.email || "—"}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {s?.assigned ?? 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {s?.completed ?? 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {s?.percent ?? 0}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {s?.overdue ?? 0}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${member.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                {member.addDate ? formatDate(member.addDate) : member.createdAt ? formatDate(member.createdAt) : "—"}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleMemberStatus(member.memberId._id)}
                                                    disabled={togglingMemberId === member.memberId._id}
                                                    className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                                                    title={member.isActive ? "Deactivate member" : "Activate member"}
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
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <div className="text-text-muted text-sm">No team members found.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ---------------------- CREATE TASK MODAL ---------------------- */}
                {isCreateTaskModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={handleCloseTaskModal}>
                        <div className="bg-white rounded-xl shadow-large w-full max-w-2xl" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
                                <button onClick={handleCloseTaskModal} className="text-gray-500 hover:text-gray-800 transition-colors p-1 cursor-pointer">
                                    <MdClose size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTask} className="p-6 space-y-6">
                                {createTaskError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {createTaskError}
                                    </div>
                                )}

                                <div className="grid grid-cols-5 items-center">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={taskFormData.title}
                                        onChange={handleTaskInputChange}
                                        required
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600"
                                        placeholder="Enter task title"
                                        disabled={createTaskLoading}
                                    />
                                </div>

                                <div className="grid grid-cols-5 items-center">
                                    <label htmlFor="desc" className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        id="desc"
                                        name="desc"
                                        value={taskFormData.desc}
                                        onChange={handleTaskInputChange}
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 resize-none"
                                        placeholder="Enter task description"
                                        disabled={createTaskLoading}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-5 items-center">
                                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={taskFormData.priority}
                                        onChange={handleTaskInputChange}
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                                        disabled={createTaskLoading}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-5 items-center">
                                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                                    <input
                                        type="date"
                                        id="dueDate"
                                        name="dueDate"
                                        value={taskFormData.dueDate}
                                        onChange={handleTaskInputChange}
                                        required
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blue-600 [color-scheme:light]"
                                        disabled={createTaskLoading}
                                    />
                                </div>

                                <div className="grid grid-cols-5 items-center">
                                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assignee</label>
                                    <select
                                        id="assignedTo"
                                        name="assignedTo"
                                        value={taskFormData.assignedTo}
                                        onChange={handleTaskInputChange}
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                                        disabled={createTaskLoading}
                                    >
                                        <option value="">Unassigned</option>
                                        {members.map((m) => (
                                            <option key={m.memberId?._id || m.memberId} value={m.memberId?._id || m.memberId}>
                                                {m.memberId?.name || m.memberId?.email || "Member"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-5 items-center">
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={taskFormData.status}
                                        onChange={handleTaskInputChange}
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                                        disabled={createTaskLoading}
                                    >
                                        <option value="UnAssigned">Unassigned</option>
                                        <option value="Assigned">Assigned</option>
                                        <option value="InProgress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="InComplete">Incomplete</option>
                                    </select>
                                </div>

                                <div className="flex justify-between gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseTaskModal}
                                        className="w-1/2 py-4 text-lg font-medium rounded-2xl bg-red-500 text-white hover:bg-red-600"
                                        disabled={createTaskLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-1/2 py-4 text-lg font-medium rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
                                        disabled={createTaskLoading}
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ---------------------- EDIT TASK MODAL ---------------------- */}
                {isEditTaskModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={handleCloseEditTaskModal}>
                        <div className="bg-white rounded-xl shadow-large w-full max-w-2xl" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
                                <button onClick={handleCloseEditTaskModal} className="text-gray-500 hover:text-gray-800 transition-colors p-1 cursor-pointer">
                                    <MdClose size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateTask} className="p-6 space-y-6">
                                {editTaskError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {editTaskError}
                                    </div>
                                )}

                                {/* same inputs as create */}
                                <div className="grid grid-cols-5 items-center">
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={taskFormData.title}
                                        onChange={handleTaskInputChange}
                                        required
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900"
                                        disabled={editTaskLoading}
                                    />
                                </div>

                                <div className="grid grid-cols-5 items-center">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        name="desc"
                                        value={taskFormData.desc}
                                        onChange={handleTaskInputChange}
                                        rows={3}
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900 resize-none"
                                        disabled={editTaskLoading}
                                    />
                                </div>

                                <div className="grid grid-cols-5 items-center">
                                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                                    <select
                                        name="priority"
                                        value={taskFormData.priority}
                                        onChange={handleTaskInputChange}
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900"
                                        disabled={editTaskLoading}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-5 items-center">
                                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={taskFormData.dueDate}
                                        onChange={handleTaskInputChange}
                                        required
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900 [color-scheme:light]"
                                        disabled={editTaskLoading}
                                    />
                                </div>

                                <div className="grid grid-cols-5 items-center">
                                    <label className="block text-sm font-medium text-gray-700">Assignee</label>
                                    <select
                                        name="assignedTo"
                                        value={taskFormData.assignedTo}
                                        onChange={handleTaskInputChange}
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900"
                                        disabled={editTaskLoading}
                                    >
                                        <option value="">Unassigned</option>
                                        {members.map((m) => (
                                            <option key={m.memberId?._id || m.memberId} value={m.memberId?._id || m.memberId}>
                                                {m.memberId?.name || m.memberId?.email || "Member"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-5 items-center">
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        name="status"
                                        value={taskFormData.status}
                                        onChange={handleTaskInputChange}
                                        className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-gray-900"
                                        disabled={editTaskLoading}
                                    >
                                        <option value="UnAssigned">Unassigned</option>
                                        <option value="Assigned">Assigned</option>
                                        <option value="InProgress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="InComplete">Incomplete</option>
                                    </select>
                                </div>

                                <div className="flex justify-between gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseEditTaskModal}
                                        className="w-1/2 py-4 text-lg font-medium rounded-2xl bg-red-500 text-white hover:bg-red-600"
                                        disabled={editTaskLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-1/2 py-4 text-lg font-medium rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
                                        disabled={editTaskLoading}
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* DELETE TASK CONFIRM */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={handleCloseDeleteModal}>
                        <div className="bg-white rounded-xl shadow-large w-full max-w-md p-6" onMouseDown={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task?</h3>
                            <p className="text-sm text-gray-700 mb-6">
                                Are you sure you want to delete <strong>{taskToDelete?.title}</strong>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseDeleteModal}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteTask}
                                    disabled={deleteTaskLoading}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {deleteTaskLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADD MEMBER MODAL */}
                {isAddMemberModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={() => setIsAddMemberModalOpen(false)}>
                        <div className="bg-white rounded-xl shadow-large w-full max-w-md p-6" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Add Member</h3>
                                <button className="text-gray-500 hover:text-gray-800" onClick={() => setIsAddMemberModalOpen(false)}>
                                    <MdClose size={18} />
                                </button>
                            </div>

                            {addMemberError && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                    {addMemberError}
                                </div>
                            )}

                            <form onSubmit={handleAddMember} className="space-y-4">
                                <input
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                    placeholder="member@email.com"
                                    value={memberEmail}
                                    onChange={(e) => setMemberEmail(e.target.value)}
                                />
                                <button
                                    disabled={addMemberLoading}
                                    className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
                                    type="submit"
                                >
                                    {addMemberLoading ? "Adding..." : "Add Member"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* REMOVE MEMBER MODAL */}
                {isRemoveMemberModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={() => setIsRemoveMemberModalOpen(false)}>
                        <div className="bg-white rounded-xl shadow-large w-full max-w-md p-6" onMouseDown={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Member?</h3>
                            {memberActionError && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                    {memberActionError}
                                </div>
                            )}
                            <p className="text-sm text-gray-700 mb-6">
                                Remove <strong>{memberToRemove?.memberId?.email}</strong> from this project?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsRemoveMemberModalOpen(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRemoveMember}
                                    disabled={removeMemberLoading}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {removeMemberLoading ? "Removing..." : "Remove"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT PROJECT MODAL */}
                {isEditProjectModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={handleCloseEditProjectModal}>
                        <div className="bg-white rounded-xl shadow-large w-full max-w-lg p-6" onMouseDown={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Project</h3>
                                <button className="text-gray-500 hover:text-gray-800" onClick={handleCloseEditProjectModal}>
                                    <MdClose size={18} />
                                </button>
                            </div>

                            {editProjectError && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                    {editProjectError}
                                </div>
                            )}

                            <form onSubmit={handleUpdateProject} className="space-y-4">
                                <input
                                    name="name"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                    placeholder="Project name"
                                    value={projectFormData.name}
                                    onChange={handleProjectInputChange}
                                />
                                <textarea
                                    name="desc"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 resize-none"
                                    placeholder="Description"
                                    value={projectFormData.desc}
                                    onChange={handleProjectInputChange}
                                />
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 [color-scheme:light]"
                                    value={projectFormData.dueDate}
                                    onChange={handleProjectInputChange}
                                />

                                <button
                                    disabled={editProjectLoading}
                                    className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
                                    type="submit"
                                >
                                    {editProjectLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* DELETE PROJECT MODAL */}
                {isDeleteProjectModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={handleCloseDeleteProjectModal}>
                        <div className="bg-white rounded-xl shadow-large w-full max-w-md p-6" onMouseDown={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project?</h3>
                            {deleteProjectError && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                    {deleteProjectError}
                                </div>
                            )}
                            <p className="text-sm text-gray-700 mb-6">
                                This will permanently delete <strong>{project.name}</strong>.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseDeleteProjectModal}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteProject}
                                    disabled={deleteProjectLoading}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {deleteProjectLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
