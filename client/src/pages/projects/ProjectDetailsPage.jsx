import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { projectService, taskService } from "../../../services/api";
import {
    MdAdd,
    MdClose,
    MdEdit,
    MdDelete,
    MdToggleOn,
    MdToggleOff,
    MdGroup,
    MdForum,
    MdOutlineTaskAlt,
    MdCalendarToday,
    MdArrowForward,
} from "react-icons/md";

export default function ProjectDetailsPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);

    const [discussionMessages, setDiscussionMessages] = useState([]);
    const [discussionText, setDiscussionText] = useState("");
    const [discussionLoading, setDiscussionLoading] = useState(false);
    const [discussionError, setDiscussionError] = useState(null);
    const [sendingDiscussion, setSendingDiscussion] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [addMemberLoading, setAddMemberLoading] = useState(false);
    const [addMemberError, setAddMemberError] = useState(null);
    const [memberEmail, setMemberEmail] = useState("");

    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
    const [removeMemberLoading, setRemoveMemberLoading] = useState(false);
    const [memberActionError, setMemberActionError] = useState(null);
    const [togglingMemberId, setTogglingMemberId] = useState(null);

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

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);

        return date.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getInitials = (name) => {
        if (!name) return "U";
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
            setTasks([]);
        }
    };

    const fetchMembers = async () => {
        try {
            const membersResponse = await projectService.listMembers(projectId);
            if (membersResponse?.success) setMembers(membersResponse.data || []);
        } catch (err) {
            console.error("Error fetching members:", err);
            setMembers([]);
        }
    };

    const fetchDiscussion = async () => {
        try {
            setDiscussionLoading(true);
            setDiscussionError(null);

            const response = await projectService.getDiscussion(projectId);
            if (response?.success) {
                setDiscussionMessages(response.data || []);
            } else {
                setDiscussionError("Failed to load discussion board");
            }
        } catch (err) {
            console.error("Error fetching discussion:", err);
            setDiscussionError("Failed to load discussion board");
            setDiscussionMessages([]);
        } finally {
            setDiscussionLoading(false);
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

                await Promise.all([fetchTasks(), fetchMembers(), fetchDiscussion()]);
            } catch (err) {
                console.error("Error fetching project details:", err);
                setError("Failed to load project details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (projectId) fetchData();
    }, [projectId]);

    const taskStats = useMemo(() => {
        const now = new Date();

        const total = tasks.length;
        const inProgress = tasks.filter((t) => t.status === "InProgress").length;
        const completed = tasks.filter((t) => t.status === "Completed").length;
        const overdue = tasks.filter((t) => {
            if (!t.dueDate) return false;
            if (t.status === "Completed") return false;
            return new Date(t.dueDate) < now;
        }).length;

        const completionRate = total ? Math.round((completed / total) * 100) : 0;

        return { total, inProgress, completed, overdue, completionRate };
    }, [tasks]);

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

        for (const [, s] of statsByUserId.entries()) {
            s.percent = Math.round((s.assigned / totalTasks) * 100);
        }

        return statsByUserId;
    }, [tasks]);

    const recentActivity = useMemo(() => {
        const discussionActivity = discussionMessages.map((message) => ({
            id: `discussion-${message._id}`,
            createdAt: message.createdAt,
            title: `${message?.sender?.name || message?.sender?.email || "Someone"} posted in discussion`,
            subtitle: message.text,
        }));

        const commentActivity = tasks.flatMap((task) =>
            (task.comments || []).map((comment) => ({
                id: `comment-${task._id}-${comment._id}`,
                createdAt: comment.createdAt,
                title: `${comment?.createdBy?.name || comment?.createdBy?.email || "Someone"} commented on "${task.title}"`,
                subtitle: comment.text,
            }))
        );

        const createdTaskActivity = tasks.map((task) => ({
            id: `task-${task._id}`,
            createdAt: task.createdAt,
            title: `Task created: "${task.title}"`,
            subtitle: task.desc || "New task added",
        }));

        return [...discussionActivity, ...commentActivity, ...createdTaskActivity]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6);
    }, [discussionMessages, tasks]);

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

    const handleToggleTaskPermission = async (memberId) => {
        setMemberActionError(null);

        try {
            const response = await projectService.toggleMemberTaskPermission(projectId, memberId);
            if (response?.success) {
                await fetchMembers();
            } else {
                setMemberActionError(response?.error || "Failed to update task permission");
            }
        } catch (err) {
            console.error("Error toggling task permission:", err);
            setMemberActionError(
                err.response?.data?.error || err.message || "Failed to update task permission."
            );
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

    const handleSendDiscussionMessage = async (e) => {
        e.preventDefault();
        setDiscussionError(null);

        if (!discussionText.trim()) return;

        try {
            setSendingDiscussion(true);

            const response = await projectService.sendDiscussionMessage(projectId, discussionText.trim());

            if (response?.success) {
                setDiscussionMessages(response.data || []);
                setDiscussionText("");
            } else {
                setDiscussionError(response?.error || "Failed to send message");
            }
        } catch (err) {
            console.error("Error sending discussion message:", err);
            setDiscussionError(err.response?.data?.error || err.message || "Failed to send message.");
        } finally {
            setSendingDiscussion(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-bg-base p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-accent-dark"></div>
                    <p className="text-sm text-text-secondary">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen w-full bg-bg-base p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-6xl">⚠️</div>
                    <h3 className="mb-2 text-xl font-semibold text-text-primary">Error loading project</h3>
                    <p className="mb-4 text-sm text-text-secondary">{error || "Project not found"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-9/10 bg-bg-base p-2">
            <div className="mx-auto space-y-6">
                <section className="rounded-3xl border border-border bg-panel px-6 py-6 shadow-soft">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-4xl font-bold text-text-primary">{project.name}</h1>

                                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    {isProjectOwner() ? "Project Admin" : "Project Member"}
                                </span>

                                {project.dueDate ? (
                                    <span className="rounded-full border border-border bg-bg-base px-3 py-1 text-xs text-text-secondary">
                                        Due {formatDate(project.dueDate)}
                                    </span>
                                ) : null}
                            </div>

                            <p className="mt-3 max-w-4xl text-base leading-7 text-text-secondary">
                                {project.desc || "No description provided"}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-4 text-sm text-text-secondary">
                                <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-bg-base px-4 py-2">
                                    <MdGroup size={16} />
                                    <span>{members.filter((m) => m.isActive).length} active members</span>
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-bg-base px-4 py-2">
                                    <MdOutlineTaskAlt size={16} />
                                    <span>{taskStats.total} total tasks</span>
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-bg-base px-4 py-2">
                                    <MdCalendarToday size={16} />
                                    <span>{project.dueDate ? `Due ${formatDate(project.dueDate)}` : "No due date"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                            <button
                                onClick={() => navigate("/tasks", { state: { selectedProjectId: projectId } })}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                <MdAdd size={18} />
                                <span>Create Task</span>
                            </button>

                            {isProjectOwner() && (
                                <>
                                    <button
                                        onClick={() => setIsAddMemberModalOpen(true)}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-bg-base px-5 py-3 text-sm font-medium text-text-primary hover:border-border-hover"
                                    >
                                        <MdGroup size={18} />
                                        <span>Add Member</span>
                                    </button>

                                    <button
                                        onClick={handleOpenEditProjectModal}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-bg-base px-5 py-3 text-sm font-medium text-text-primary hover:border-border-hover"
                                    >
                                        <MdEdit size={18} />
                                        <span>Edit Project</span>
                                    </button>

                                    <button
                                        onClick={handleOpenDeleteProjectModal}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                                    >
                                        <MdDelete size={18} />
                                        <span>Delete Project</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl border border-border bg-panel px-5 py-5 shadow-soft">
                        <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Total Tasks</div>
                        <div className="mt-2 text-3xl font-bold text-text-primary">{taskStats.total}</div>
                        <p className="mt-2 text-sm text-text-secondary">All tasks in this project</p>
                    </div>

                    <div className="rounded-3xl border border-border bg-panel px-5 py-5 shadow-soft">
                        <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">In Progress</div>
                        <div className="mt-2 text-3xl font-bold text-text-primary">
                            {tasks.filter((t) => t.status === "InProgress").length}
                        </div>
                        <p className="mt-2 text-sm text-text-secondary">Currently being worked on</p>
                    </div>

                    <div className="rounded-3xl border border-border bg-panel px-5 py-5 shadow-soft">
                        <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Completed</div>
                        <div className="mt-2 text-3xl font-bold text-text-primary">{taskStats.completed}</div>
                        <p className="mt-2 text-sm text-text-secondary">
                            {taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% completion rate
                        </p>
                    </div>

                    <div className="rounded-3xl border border-border bg-panel px-5 py-5 shadow-soft">
                        <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Overdue</div>
                        <div className="mt-2 text-3xl font-bold text-red-500">{taskStats.overdue}</div>
                        <p className="mt-2 text-sm text-text-secondary">Need attention soonest</p>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr,0.8fr]">
                    <div className="rounded-3xl border border-border bg-panel px-6 py-6 shadow-soft">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold text-text-primary">Team Members</h2>
                                <p className="mt-1 text-sm text-text-secondary">
                                    Assigned work, completion, overdue load, and task permissions.
                                </p>
                            </div>

                            <span className="rounded-full border border-border bg-bg-base px-3 py-1 text-xs text-text-secondary">
                                {members.length} total
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {members.length > 0 ? (
                                members.map((member) => {
                                    const uid = member.memberId?._id || member.memberId;
                                    const s = uid ? memberStats.get(uid) : null;

                                    return (
                                        <div key={member._id} className="rounded-3xl border border-border bg-bg-base p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                                        {getInitials(member.memberId?.name || member.memberId?.email || "U")}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-base font-semibold text-text-primary">
                                                            {member.memberId?.name || "—"}
                                                        </h3>
                                                        <p className="truncate text-sm text-text-secondary">
                                                            {member.memberId?.email || "—"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${member.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-slate-100 text-slate-700"
                                                        }`}
                                                >
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            <div className="mt-5 grid grid-cols-2 gap-3">
                                                <div className="rounded-2xl border border-border bg-panel px-4 py-3">
                                                    <div className="text-xs uppercase tracking-wide text-text-muted">Assigned</div>
                                                    <div className="mt-1 text-xl font-semibold text-text-primary">{s?.assigned ?? 0}</div>
                                                </div>

                                                <div className="rounded-2xl border border-border bg-panel px-4 py-3">
                                                    <div className="text-xs uppercase tracking-wide text-text-muted">Completed</div>
                                                    <div className="mt-1 text-xl font-semibold text-text-primary">{s?.completed ?? 0}</div>
                                                </div>

                                                <div className="rounded-2xl border border-border bg-panel px-4 py-3">
                                                    <div className="text-xs uppercase tracking-wide text-text-muted">% of Project</div>
                                                    <div className="mt-1 text-xl font-semibold text-text-primary">{s?.percent ?? 0}%</div>
                                                </div>

                                                <div className="rounded-2xl border border-border bg-panel px-4 py-3">
                                                    <div className="text-xs uppercase tracking-wide text-text-muted">Overdue</div>
                                                    <div className="mt-1 text-xl font-semibold text-red-500">{s?.overdue ?? 0}</div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
                                                <span>Joined {formatDate(member.addDate || member.createdAt)}</span>

                                                {isProjectOwner() && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button
                                                            onClick={() => handleToggleMemberStatus(member.memberId._id)}
                                                            disabled={togglingMemberId === member.memberId._id}
                                                            className="inline-flex items-center gap-1 rounded-2xl border border-border bg-panel px-3 py-2 text-sm hover:border-border-hover disabled:opacity-60"
                                                            title={member.isActive ? "Deactivate member" : "Activate member"}
                                                        >
                                                            {member.isActive ? <MdToggleOn size={18} /> : <MdToggleOff size={18} />}
                                                            <span>
                                                                {togglingMemberId === member.memberId._id
                                                                    ? "Saving..."
                                                                    : member.isActive
                                                                        ? "Deactivate"
                                                                        : "Activate"}
                                                            </span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleToggleTaskPermission(member.memberId._id)}
                                                            className={`inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium ${member.canManageTasks
                                                                    ? "bg-green-600 text-white hover:bg-green-700"
                                                                    : "bg-slate-600 text-white hover:bg-slate-700"
                                                                }`}
                                                            title={member.canManageTasks ? "Can create/edit tasks" : "Cannot create/edit tasks"}
                                                        >
                                                            {member.canManageTasks ? "Task Access: On" : "Task Access: Off"}
                                                        </button>

                                                        <button
                                                            onClick={() => handleRemoveMemberClick(member)}
                                                            className="inline-flex items-center gap-1 rounded-2xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                                                        >
                                                            <MdDelete size={16} />
                                                            <span>Remove</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="lg:col-span-2 rounded-3xl border border-dashed border-border bg-bg-base px-6 py-10 text-center text-text-muted">
                                    No team members found.
                                </div>
                            )}
                        </div>

                        {memberActionError && (
                            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {memberActionError}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-border bg-panel px-6 py-6 shadow-soft">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-semibold text-text-primary">Recent Activity</h2>
                                    <p className="mt-1 text-sm text-text-secondary">
                                        Latest discussion and task updates.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((item) => (
                                        <div key={item.id} className="rounded-2xl border border-border bg-bg-base px-4 py-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                                                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{item.subtitle}</p>
                                                </div>

                                                <span className="shrink-0 text-xs text-text-muted">
                                                    {formatDateTime(item.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-border bg-bg-base px-4 py-10 text-center text-text-muted">
                                        No recent activity yet.
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => navigate("/tasks", { state: { selectedProjectId: projectId } })}
                                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                <span>Open task board</span>
                                <MdArrowForward size={16} />
                            </button>
                        </section>

                        <section className="rounded-3xl border border-border bg-panel px-6 py-6 shadow-soft">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-semibold text-text-primary">Discussion Board</h2>
                                    <p className="mt-1 text-sm text-text-secondary">
                                        Project updates, questions, and team discussion live here.
                                    </p>
                                </div>

                                <span className="rounded-full border border-border bg-bg-base px-3 py-1 text-xs text-text-secondary">
                                    {discussionMessages.length} message{discussionMessages.length === 1 ? "" : "s"}
                                </span>
                            </div>

                            <div className="rounded-3xl border border-border bg-bg-base">
                                <div className="max-h-[360px] overflow-y-auto border-b border-border p-4">
                                    {discussionLoading ? (
                                        <div className="py-10 text-center text-sm text-text-muted">
                                            Loading discussion...
                                        </div>
                                    ) : discussionMessages.length > 0 ? (
                                        <div className="space-y-3">
                                            {discussionMessages.map((msg) => (
                                                <div
                                                    key={msg._id || `${msg.createdAt}-${msg.text}`}
                                                    className="rounded-2xl border border-border bg-panel px-4 py-4"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                                            {getInitials(msg?.sender?.name || msg?.sender?.email || "U")}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                                <div>
                                                                    <div className="text-sm font-semibold text-text-primary">
                                                                        {msg?.sender?.name || msg?.sender?.email || "User"}
                                                                    </div>
                                                                    <div className="text-xs text-text-muted">
                                                                        {formatDateTime(msg.createdAt)}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                                                                {msg.text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center">
                                            <MdForum size={32} className="mx-auto mb-3 text-text-muted" />
                                            <p className="text-sm text-text-muted">
                                                No messages yet. Start the team conversation.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSendDiscussionMessage} className="p-4">
                                    {discussionError && (
                                        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                            {discussionError}
                                        </div>
                                    )}

                                    <textarea
                                        value={discussionText}
                                        onChange={(e) => setDiscussionText(e.target.value)}
                                        rows={4}
                                        placeholder="Write a message to the team..."
                                        className="w-full resize-none rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-text-primary outline-none focus:border-border-hover"
                                    />

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={sendingDiscussion || !discussionText.trim()}
                                            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            {sendingDiscussion ? "Sending..." : "Send Message"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </div>
                </section>
            </div>

            {isAddMemberModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
                    onMouseDown={() => setIsAddMemberModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Add Member</h3>
                                <p className="mt-1 text-sm text-gray-500">Only the project admin can manage members.</p>
                            </div>

                            <button
                                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                onClick={() => setIsAddMemberModalOpen(false)}
                            >
                                <MdClose size={18} />
                            </button>
                        </div>

                        <div className="px-6 py-6">
                            {addMemberError && (
                                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {addMemberError}
                                </div>
                            )}

                            <form onSubmit={handleAddMember} className="grid gap-4">
                                <input
                                    value={memberEmail}
                                    onChange={(e) => setMemberEmail(e.target.value)}
                                    placeholder="member@email.com"
                                    className="rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                                />

                                <button
                                    type="submit"
                                    disabled={addMemberLoading}
                                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {addMemberLoading ? "Adding..." : "Add Member"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isRemoveMemberModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
                    onMouseDown={() => setIsRemoveMemberModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-6">
                            <h3 className="text-xl font-semibold text-gray-900">Remove Member?</h3>
                            <p className="mt-3 text-sm text-gray-600">
                                Remove <strong>{memberToRemove?.memberId?.email}</strong> from this project?
                            </p>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setIsRemoveMemberModalOpen(false)}
                                    className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleRemoveMember}
                                    disabled={removeMemberLoading}
                                    className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {removeMemberLoading ? "Removing..." : "Remove"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditProjectModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
                    onMouseDown={handleCloseEditProjectModal}
                >
                    <div
                        className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white shadow-2xl"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Edit Project</h3>
                                <p className="mt-1 text-sm text-gray-500">Only the project admin can edit project details.</p>
                            </div>

                            <button
                                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                onClick={handleCloseEditProjectModal}
                            >
                                <MdClose size={18} />
                            </button>
                        </div>

                        <div className="px-6 py-6">
                            {editProjectError && (
                                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {editProjectError}
                                </div>
                            )}

                            <form onSubmit={handleUpdateProject} className="grid gap-4">
                                <input
                                    name="name"
                                    value={projectFormData.name}
                                    onChange={handleProjectInputChange}
                                    placeholder="Project name"
                                    className="rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                                />

                                <textarea
                                    name="desc"
                                    rows={4}
                                    value={projectFormData.desc}
                                    onChange={handleProjectInputChange}
                                    placeholder="Project description"
                                    className="resize-none rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                                />

                                <input
                                    type="date"
                                    name="dueDate"
                                    value={projectFormData.dueDate}
                                    onChange={handleProjectInputChange}
                                    className="rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 [color-scheme:light]"
                                />

                                <button
                                    type="submit"
                                    disabled={editProjectLoading}
                                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {editProjectLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteProjectModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
                    onMouseDown={handleCloseDeleteProjectModal}
                >
                    <div
                        className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-6">
                            <h3 className="text-xl font-semibold text-gray-900">Delete Project?</h3>

                            {deleteProjectError && (
                                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {deleteProjectError}
                                </div>
                            )}

                            <p className="mt-3 text-sm text-gray-600">
                                This permanently deletes <strong>{project.name}</strong>.
                            </p>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleCloseDeleteProjectModal}
                                    className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDeleteProject}
                                    disabled={deleteProjectLoading}
                                    className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {deleteProjectLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}