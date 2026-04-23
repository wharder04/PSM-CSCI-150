import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { MdAdd, MdFilterList, MdClose, MdSearch } from "react-icons/md";
import { toast } from "react-toastify";

import { useAuth } from "../../AuthContext.jsx";
import { projectService, taskService } from "../../../services/api.js";
import CreateTaskModal from "../../components/tasks/CreateTaskModal.jsx";
import TaskCommentsModal from "../../components/tasks/TaskCommentsModal.jsx";
import TaskColumn from "../../components/tasks/TaskColumn.jsx";
import TaskCard from "../../components/tasks/TaskCard.jsx";
import { COLUMNS, STATUS } from "../../components/tasks/taskUtils.js";

function normalizeStatusForColumns(status) {
    if (status === STATUS.IN_PROGRESS) return STATUS.IN_PROGRESS;
    if (status === STATUS.COMPLETED) return STATUS.COMPLETED;
    if (status === STATUS.INCOMPLETE) return STATUS.INCOMPLETE;
    return STATUS.UNASSIGNED;
}

function safeId(value) {
    return value ? String(value) : "";
}

function getDateRangeAnchors(now = new Date()) {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    return { startOfToday, endOfToday, startOfWeek, endOfWeek };
}

function getProjectAdminId(project) {
    return safeId(project?.ownerId?._id || project?.ownerId);
}

function normalizeProjectsResponse(res) {
    if (!res) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res?.data?.owner) || Array.isArray(res?.data?.memberOf)) {
        return [...(res.data.owner || []), ...(res.data.memberOf || [])];
    }
    if (Array.isArray(res?.owner) || Array.isArray(res?.memberOf)) {
        return [...(res.owner || []), ...(res.memberOf || [])];
    }
    return [];
}

function normalizeTasksResponse(res) {
    if (!res) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res?.tasks)) return res.tasks;
    if (Array.isArray(res)) return res;
    return [];
}

function normalizeMembersResponse(res) {
    if (!res) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res?.members)) return res.members;
    if (Array.isArray(res)) return res;
    return [];
}

export default function TaskBoard() {
    const { user } = useAuth();
    const location = useLocation();

    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(
        location.state?.selectedProjectId || ""
    );
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [commentTask, setCommentTask] = useState(null);
    const [savingComment, setSavingComment] = useState(false);

    const [activeId, setActiveId] = useState(null);
    const lastOverId = useRef(null);

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [priorityFilters, setPriorityFilters] = useState([]);
    const [assigneeFilters, setAssigneeFilters] = useState([]);
    const [dueFilter, setDueFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [onlyMyTasks, setOnlyMyTasks] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await projectService.myProjects();
            const list = normalizeProjectsResponse(res).filter((project) => project && project._id);

            setProjects(list);

            if (!activeProjectId && list.length > 0) {
                const incomingId = location.state?.selectedProjectId;
                const exists = list.some((project) => project._id === incomingId);
                setActiveProjectId(exists ? incomingId : list[0]._id);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load projects");
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBoardData = async (projectId) => {
        if (!projectId) {
            setTasks([]);
            setMembers([]);
            return;
        }

        try {
            setLoading(true);

            const [tasksRes, membersRes] = await Promise.all([
                taskService.listTasks(projectId),
                projectService.listMembers(projectId),
            ]);

            const nextTasks = normalizeTasksResponse(tasksRes).filter((task) => task && task._id);
            const nextMembers = normalizeMembersResponse(membersRes).filter(Boolean);

            setTasks(nextTasks);
            setMembers(nextMembers);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load task board");
            setTasks([]);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (!activeProjectId) return;
        fetchBoardData(activeProjectId);
    }, [activeProjectId]);

    const activeProject = useMemo(
        () => projects.find((project) => project._id === activeProjectId) || null,
        [projects, activeProjectId]
    );

    const isProjectAdmin = useMemo(() => {
        return getProjectAdminId(activeProject) === safeId(user?._id);
    }, [activeProject, user]);

    const currentMemberRecord = useMemo(() => {
        return (
            members.find(
                (m) => safeId(m?.memberId?._id || m?.memberId) === safeId(user?._id)
            ) || null
        );
    }, [members, user]);

    const canCurrentUserManageTasks = useMemo(() => {
        if (isProjectAdmin) return true;
        return !!currentMemberRecord?.canManageTasks;
    }, [isProjectAdmin, currentMemberRecord]);

    const tasksWithUiStatus = useMemo(() => {
        return (tasks || [])
            .filter((task) => task && task._id)
            .map((task) => ({
                ...task,
                uiStatus: normalizeStatusForColumns(task.status),
            }));
    }, [tasks]);

    const boardStats = useMemo(() => {
        const total = tasksWithUiStatus.length;
        const unassigned = tasksWithUiStatus.filter((task) => task.uiStatus === STATUS.UNASSIGNED).length;
        const inProgress = tasksWithUiStatus.filter((task) => task.uiStatus === STATUS.IN_PROGRESS).length;
        const overdue = tasksWithUiStatus.filter((task) => {
            if (!task?.dueDate) return false;
            if (task?.status === STATUS.COMPLETED) return false;
            return new Date(task.dueDate) < new Date();
        });

        return { total, unassigned, inProgress, overdue: overdue.length };
    }, [tasksWithUiStatus]);

    const filteredTasks = useMemo(() => {
        const { startOfToday, endOfToday, startOfWeek, endOfWeek } = getDateRangeAnchors(new Date());

        return tasksWithUiStatus.filter((task) => {
            const titleMatch =
                !search.trim() ||
                (task.title || "").toLowerCase().includes(search.trim().toLowerCase());

            const priorityOk =
                priorityFilters.length === 0 || priorityFilters.includes(task.priority);

            const assignedToId = safeId(task?.assignedTo?._id || task?.assignedTo);
            const assigneeOk =
                assigneeFilters.length === 0 || assigneeFilters.includes(assignedToId);

            const myTaskOk = !onlyMyTasks || assignedToId === safeId(user?._id);

            const rawDue = task?.dueDate;
            const due = rawDue ? new Date(rawDue) : null;

            let dueOk = true;
            if (dueFilter === "NO_DUE_DATE") dueOk = !due;
            else if (dueFilter === "OVERDUE") dueOk = !!due && due < startOfToday;
            else if (dueFilter === "TODAY") dueOk = !!due && due >= startOfToday && due < endOfToday;
            else if (dueFilter === "THIS_WEEK") dueOk = !!due && due >= startOfWeek && due < endOfWeek;

            return titleMatch && priorityOk && assigneeOk && myTaskOk && dueOk;
        });
    }, [tasksWithUiStatus, priorityFilters, assigneeFilters, dueFilter, search, onlyMyTasks, user]);

    const columnsToTasks = useMemo(() => {
        const map = {
            [STATUS.UNASSIGNED]: [],
            [STATUS.IN_PROGRESS]: [],
            [STATUS.COMPLETED]: [],
            [STATUS.INCOMPLETE]: [],
        };

        for (const task of filteredTasks) {
            if (!task || !task._id) continue;
            map[task.uiStatus].push(task);
        }

        for (const key of Object.keys(map)) {
            map[key].sort((a, b) => {
                const ao = a.order ?? 0;
                const bo = b.order ?? 0;
                if (ao !== bo) return ao - bo;
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
        }

        return map;
    }, [filteredTasks]);

    const activeFilterChips = useMemo(() => {
        const chips = [];

        priorityFilters.forEach((priority) => {
            chips.push({
                key: `priority-${priority}`,
                label: `Priority: ${priority}`,
                onRemove: () =>
                    setPriorityFilters((prev) => prev.filter((value) => value !== priority)),
            });
        });

        assigneeFilters.forEach((id) => {
            const member = members.find((m) => safeId(m?.memberId?._id || m?.memberId) === id);
            const label = member?.memberId?.name || member?.memberId?.email || "Member";

            chips.push({
                key: `assignee-${id}`,
                label: `Assignee: ${label}`,
                onRemove: () =>
                    setAssigneeFilters((prev) => prev.filter((value) => value !== id)),
            });
        });

        if (dueFilter !== "ALL") {
            const dueMap = {
                OVERDUE: "Due: Overdue",
                TODAY: "Due: Today",
                THIS_WEEK: "Due: This Week",
                NO_DUE_DATE: "Due: None",
            };

            chips.push({
                key: "due",
                label: dueMap[dueFilter] || "Due Filter",
                onRemove: () => setDueFilter("ALL"),
            });
        }

        if (onlyMyTasks) {
            chips.push({
                key: "mine",
                label: "My Tasks",
                onRemove: () => setOnlyMyTasks(false),
            });
        }

        return chips;
    }, [priorityFilters, assigneeFilters, dueFilter, onlyMyTasks, members]);

    const filtersActive =
        priorityFilters.length > 0 ||
        assigneeFilters.length > 0 ||
        dueFilter !== "ALL" ||
        onlyMyTasks;

    const togglePriority = (priority) => {
        setPriorityFilters((prev) =>
            prev.includes(priority)
                ? prev.filter((value) => value !== priority)
                : [...prev, priority]
        );
    };

    const toggleAssignee = (id) => {
        setAssigneeFilters((prev) =>
            prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
        );
    };

    const clearFilters = () => {
        setPriorityFilters([]);
        setAssigneeFilters([]);
        setDueFilter("ALL");
        setOnlyMyTasks(false);
    };

    const openCreateModal = () => {
        if (!canCurrentUserManageTasks) {
            toast.info("You are not allowed to create tasks in this project.");
            return;
        }

        setEditingTask(null);
        setTaskModalOpen(true);
    };

    const openEditModal = (task) => {
        if (!task || !task._id) return;

        if (!canCurrentUserManageTasks) {
            toast.info("You are not allowed to edit tasks in this project.");
            return;
        }

        setEditingTask(task);
        setTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setTaskModalOpen(false);
        setEditingTask(null);
    };

    const openCommentModal = (task) => {
        if (!task || !task._id) return;
        setCommentTask(task);
        setCommentModalOpen(true);
    };

    const closeCommentModal = () => {
        setCommentTask(null);
        setCommentModalOpen(false);
    };

    const onCreateTask = async (projectId, payload) => {
        try {
            const res = await taskService.createTask(projectId, payload);

            if (res?.success) {
                toast.success("Task created");
                closeTaskModal();
                await fetchBoardData(projectId);
            } else {
                throw new Error(res?.error || "Failed to create task");
            }
        } catch (error) {
            console.error("onCreateTask error:", error);
            toast.error(error?.response?.data?.error || error?.message || "Failed to create task");
            throw error;
        }
    };

    const onUpdateTask = async (taskId, payload) => {
        try {
            const res = await taskService.updateTask(taskId, payload);

            if (res?.success) {
                toast.success("Task updated");
                closeTaskModal();
                await fetchBoardData(activeProjectId);
            } else {
                throw new Error(res?.error || "Failed to update task");
            }
        } catch (error) {
            console.error("onUpdateTask error:", error);
            toast.error(error?.response?.data?.error || error?.message || "Failed to update task");
            throw error;
        }
    };

    const onAddComment = async (taskId, text) => {
        try {
            setSavingComment(true);
            const res = await taskService.addComment(taskId, text);
            const updatedTask = res?.success ? res.data : null;

            if (!updatedTask) {
                toast.error(res?.error || "Failed to add comment");
                return false;
            }

            setTasks((prev) => prev.map((task) => (task._id === taskId ? updatedTask : task)));
            setCommentTask(updatedTask);
            toast.success("Comment added");
            return true;
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error || "Failed to add comment");
            return false;
        } finally {
            setSavingComment(false);
        }
    };

    const findTask = (id) =>
        tasksWithUiStatus.find((task) => task && String(task._id) === String(id)) || null;

    const findContainer = (id) => {
        if (COLUMNS.some((column) => column.id === id)) return id;
        const task = findTask(id);
        return task ? task.uiStatus : null;
    };

    const isAssignedToCurrentUser = (task) => {
        const assignedId = safeId(task?.assignedTo?._id || task?.assignedTo);
        return assignedId && assignedId === safeId(user?._id);
    };

    const canDragTask = (task) => {
        if (!task) return false;
        if (!task?.assignedTo?._id && !task?.assignedTo) return false;
        return isAssignedToCurrentUser(task);
    };

    const persistTaskMove = async (taskId, nextStatus, nextOrder) => {
        try {
            const res = await taskService.updateTask(taskId, {
                status: nextStatus,
                order: nextOrder,
            });

            if (!res?.success) {
                throw new Error(res?.error || "Failed to move task");
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error || error?.message || "Failed to move task");
            await fetchBoardData(activeProjectId);
        }
    };

    const onDragStart = (event) => {
        const task = findTask(event.active.id);

        if (!task) {
            setActiveId(null);
            return;
        }

        if (!canDragTask(task)) {
            if (!task?.assignedTo?._id && !task?.assignedTo) {
                toast.info("Assign this task before moving it.");
            } else {
                toast.info("Only the assigned user can move this task.");
            }
            setActiveId(null);
            return;
        }

        setActiveId(event.active.id);
    };

    const onDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = findTask(active.id);
        if (!activeTask || !canDragTask(activeTask)) return;

        lastOverId.current = over.id;

        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over.id);

        if (!activeContainer || !overContainer) return;
        if (activeContainer === overContainer) return;

        if (overContainer === STATUS.UNASSIGNED) return;

        setTasks((prev) =>
            prev.map((task) =>
                task._id === active.id ? { ...task, status: overContainer } : task
            )
        );
    };

    const onDragEnd = async (event) => {
        const { active, over } = event;
        const activeTask = findTask(active.id);

        setActiveId(null);

        if (!activeTask || !canDragTask(activeTask)) {
            lastOverId.current = null;
            return;
        }

        const overId = over?.id || lastOverId.current;
        lastOverId.current = null;

        if (!overId) {
            await fetchBoardData(activeProjectId);
            return;
        }

        const toCol = findContainer(overId);
        if (!toCol) {
            await fetchBoardData(activeProjectId);
            return;
        }

        if (toCol === STATUS.UNASSIGNED) {
            toast.info("Tasks cannot be dragged back to Unassigned. Remove the assignee instead.");
            await fetchBoardData(activeProjectId);
            return;
        }

        const toTasks = columnsToTasks[toCol] || [];
        const isOverColumn = COLUMNS.some((column) => column.id === overId);
        const overIndex = isOverColumn
            ? toTasks.length
            : toTasks.findIndex((task) => String(task._id) === String(overId));

        const before = toTasks[overIndex - 1];
        const after = toTasks[overIndex];

        let nextOrder = 1000;
        if (!before && !after) nextOrder = 1000;
        else if (before && !after) nextOrder = (before.order ?? 0) + 1000;
        else if (!before && after) nextOrder = (after.order ?? 0) - 1000;
        else nextOrder = Math.floor(((before.order ?? 0) + (after.order ?? 0)) / 2);

        setTasks((prev) =>
            prev.map((task) =>
                task._id === active.id ? { ...task, status: toCol, order: nextOrder } : task
            )
        );

        await persistTaskMove(active.id, toCol, nextOrder);
    };

    const activeTask = activeId ? findTask(activeId) : null;

    const FiltersPopover = () => {
        if (!filtersOpen) return null;

        return (
            <div className="absolute left-0 top-14 z-50 w-[360px] rounded-3xl border border-border-default bg-bg-surface p-5 shadow-large">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary">Filters</h3>
                        <p className="mt-1 text-xs text-text-muted">
                            Narrow the board to what matters right now.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        className="rounded-xl p-2 text-text-secondary hover:bg-bg-main hover:text-text-primary"
                    >
                        <MdClose size={18} />
                    </button>
                </div>

                <div className="grid gap-5">
                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Priority
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["High", "Medium", "Low"].map((priority) => {
                                const active = priorityFilters.includes(priority);

                                return (
                                    <button
                                        key={priority}
                                        type="button"
                                        onClick={() => togglePriority(priority)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-border-default bg-bg-main text-text-secondary"
                                            }`}
                                    >
                                        {priority}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Assignee
                        </div>
                        <div className="max-h-[170px] space-y-2 overflow-auto pr-1">
                            {members.length > 0 ? (
                                members.map((member, index) => {
                                    const id = safeId(member?.memberId?._id || member?.memberId || member?._id);
                                    const label =
                                        member?.memberId?.name ||
                                        member?.memberId?.email ||
                                        member?.name ||
                                        member?.email ||
                                        `Member ${index + 1}`;

                                    if (!id) return null;

                                    return (
                                        <label
                                            key={id}
                                            className="flex items-center gap-3 rounded-xl border border-border-default bg-bg-main px-3 py-2 text-sm text-text-secondary"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={assigneeFilters.includes(id)}
                                                onChange={() => toggleAssignee(id)}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    );
                                })
                            ) : (
                                <div className="text-sm text-text-muted">No members found.</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Due Date
                        </div>
                        <select
                            value={dueFilter}
                            onChange={(e) => setDueFilter(e.target.value)}
                            className="w-full rounded-2xl border border-border-default bg-bg-main px-4 py-3 text-sm text-text-primary outline-none"
                        >
                            <option value="ALL">All due dates</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="TODAY">Due today</option>
                            <option value="THIS_WEEK">Due this week</option>
                            <option value="NO_DUE_DATE">No due date</option>
                        </select>
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl border border-border-default bg-bg-main px-4 py-3 text-sm text-text-secondary">
                        <input
                            type="checkbox"
                            checked={onlyMyTasks}
                            onChange={(e) => setOnlyMyTasks(e.target.checked)}
                        />
                        <span>Show only my assigned tasks</span>
                    </label>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-2xl border border-border-default bg-bg-main px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
                        >
                            Clear all
                        </button>

                        <button
                            type="button"
                            onClick={() => setFiltersOpen(false)}
                            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && projects.length === 0 && !activeProjectId) {
        return (
            <div className="min-h-screen bg-bg-main p-6">
                <div className="rounded-[28px] border border-border-default bg-bg-surface px-6 py-8 shadow-soft">
                    <p className="text-text-secondary">Loading task board...</p>
                </div>
            </div>
        );
    }

    if (!loading && projects.length === 0) {
        return (
            <div className="min-h-screen bg-bg-main p-6">
                <div className="rounded-[28px] border border-border-default bg-bg-surface px-6 py-8 shadow-soft">
                    <h1 className="text-2xl font-bold text-text-primary">Task Board</h1>
                    <p className="mt-3 text-text-secondary">
                        No projects found yet. Create a project first to use the task board.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-bg-main p-3">
            <div className="mx-auto max-w-[1600px]">
                <div className="rounded-[28px] border border-border-default bg-bg-surface px-6 py-6 shadow-soft">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                                    Task Board
                                </h1>

                                {activeProject ? (
                                    <span className="rounded-full border border-border-default bg-bg-main px-3 py-1 text-sm text-text-secondary">
                                        {activeProject.name}
                                    </span>
                                ) : null}

                                {isProjectAdmin ? (
                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                        Project Admin
                                    </span>
                                ) : null}

                                {!canCurrentUserManageTasks ? (
                                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                        Task Access Off
                                    </span>
                                ) : null}
                            </div>

                            <p className="mt-2 text-sm text-text-secondary">
                                Manage tasks by column, assignee, and permission.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {projects.length > 1 ? (
                                <select
                                    value={activeProjectId}
                                    onChange={(e) => setActiveProjectId(e.target.value)}
                                    className="min-w-[240px] rounded-2xl border border-border-default bg-bg-main px-4 py-3 text-text-primary outline-none"
                                >
                                    {projects.map((project) => (
                                        <option key={project._id} value={project._id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            ) : null}

                            <button
                                type="button"
                                onClick={openCreateModal}
                                disabled={!canCurrentUserManageTasks}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <MdAdd size={18} />
                                <span>Create Task</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-border-default bg-bg-main px-5 py-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                                Total Tasks
                            </div>
                            <div className="mt-2 text-3xl font-bold text-text-primary">{boardStats.total}</div>
                        </div>

                        <div className="rounded-2xl border border-border-default bg-bg-main px-5 py-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                                Unassigned
                            </div>
                            <div className="mt-2 text-3xl font-bold text-text-primary">{boardStats.unassigned}</div>
                        </div>

                        <div className="rounded-2xl border border-border-default bg-bg-main px-5 py-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                                In Progress
                            </div>
                            <div className="mt-2 text-3xl font-bold text-text-primary">{boardStats.inProgress}</div>
                        </div>

                        <div className="rounded-2xl border border-border-default bg-bg-main px-5 py-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                                Overdue
                            </div>
                            <div className="mt-2 text-3xl font-bold text-red-500">{boardStats.overdue}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 rounded-[28px] border border-border-default bg-bg-surface px-6 py-5 shadow-soft">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-2xl border border-border-default bg-bg-main px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary"
                                onClick={() => setFiltersOpen((value) => !value)}
                            >
                                <MdFilterList size={18} />
                                <span>Filters</span>
                                {filtersActive ? (
                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                        Active
                                    </span>
                                ) : null}
                            </button>

                            <FiltersPopover />

                            <label className="relative block min-w-[260px]">
                                <MdSearch
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                                />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search task titles"
                                    className="w-full rounded-2xl border border-border-default bg-bg-main py-2.5 pl-11 pr-4 text-sm text-text-primary outline-none"
                                />
                            </label>
                        </div>

                        <div className="text-sm text-text-muted">{filteredTasks.length} shown</div>
                    </div>

                    {activeFilterChips.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {activeFilterChips.map((chip) => (
                                <button
                                    key={chip.key}
                                    type="button"
                                    onClick={chip.onRemove}
                                    className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-main px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
                                >
                                    <span>{chip.label}</span>
                                    <MdClose size={14} />
                                </button>
                            ))}
                        </div>
                    ) : null}

                    <div className="mt-6 overflow-x-auto">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDragEnd={onDragEnd}
                        >
                            <div className="flex gap-5 pb-3">
                                {COLUMNS.map((column) => (
                                    <TaskColumn
                                        key={column.id}
                                        column={column}
                                        tasks={columnsToTasks[column.id] || []}
                                        onEditTask={openEditModal}
                                        onCommentTask={openCommentModal}
                                        canDragTask={canDragTask}
                                        isAssignedToCurrentUser={isAssignedToCurrentUser}
                                        canEditTask={canCurrentUserManageTasks}
                                    />
                                ))}
                            </div>

                            <DragOverlay>
                                {activeTask ? (
                                    <div className="w-[320px]">
                                        <TaskCard
                                            task={activeTask}
                                            onEdit={openEditModal}
                                            onComment={openCommentModal}
                                            canDrag={canDragTask(activeTask)}
                                            isAssignedToCurrentUser={isAssignedToCurrentUser(activeTask)}
                                            canEditTask={canCurrentUserManageTasks}
                                        />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>

                    {!loading ? (
                        <div className="mt-5 rounded-2xl border border-border-default bg-bg-main px-4 py-3 text-xs text-text-muted">
                            Rules: only assigned users can drag tasks, and a task returns to Unassigned only when its assignee is removed or cleared.
                        </div>
                    ) : null}
                </div>
            </div>

            <CreateTaskModal
                isOpen={taskModalOpen}
                onClose={closeTaskModal}
                onCreate={onCreateTask}
                onUpdate={onUpdateTask}
                projects={projects}
                members={members}
                defaultProjectId={activeProjectId}
                initialTask={editingTask}
            />

            <TaskCommentsModal
                isOpen={commentModalOpen}
                onClose={closeCommentModal}
                task={commentTask}
                onAddComment={onAddComment}
                saving={savingComment}
            />
        </div>
    );
}
