import { useEffect, useMemo, useRef, useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MdAdd, MdFilterList } from "react-icons/md";
import { toast } from "react-toastify";

import { projectService, taskService } from "../../../services/api.js";
import CreateTaskModal from "../../components/tasks/CreateTaskModal.jsx";
import TaskColumn from "../../components/tasks/TaskColumn.jsx";
import TaskCard from "../../components/tasks/TaskCard.jsx";
import { COLUMNS, STATUS } from "../../components/tasks/taskUtils.js";

function normalizeStatusForColumns(status) {
    if (status === STATUS.IN_PROGRESS) return STATUS.IN_PROGRESS;
    if (status === STATUS.COMPLETED) return STATUS.COMPLETED;
    if (status === STATUS.INCOMPLETE) return STATUS.INCOMPLETE;
    return STATUS.ASSIGNED;
}

function safeId(v) {
    return v ? String(v) : "";
}

function getDateRangeAnchors(now = new Date()) {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Week starts Sunday (matches your earlier board logic style)
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return { startOfToday, endOfToday, startOfWeek, endOfWeek };
}

export default function TaskBoard() {
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState("");
    const [members, setMembers] = useState([]);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create modal
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // DnD
    const [activeId, setActiveId] = useState(null);
    const lastOverId = useRef(null);

    // Multi-choice Filters popover
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [priorityFilters, setPriorityFilters] = useState([]); // ["Low","Medium","High"]
    const [assigneeFilters, setAssigneeFilters] = useState([]); // ["userId1",...]
    const [dueFilter, setDueFilter] = useState("ALL"); // ALL | OVERDUE | TODAY | THIS_WEEK | NO_DUE_DATE

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await projectService.myProjects();
            const list = [...(res?.data?.owner || []), ...(res?.data?.memberOf || [])];
            setProjects(list);
            if (list.length && !activeProjectId) setActiveProjectId(list[0]._id);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const fetchBoardData = async (projectId) => {
        if (!projectId) return;
        try {
            setLoading(true);

            const [tasksRes, membersRes] = await Promise.all([
                taskService.listTasks(projectId),
                projectService.listMembers(projectId),
            ]);

            // services may return either {data: []} or {success, data: []}
            const nextTasks = tasksRes?.success ? tasksRes.data : tasksRes?.data;
            const nextMembers = membersRes?.success ? membersRes.data : membersRes?.data;

            setTasks(Array.isArray(nextTasks) ? nextTasks : []);
            setMembers(Array.isArray(nextMembers) ? nextMembers : []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!activeProjectId) return;
        fetchBoardData(activeProjectId);
    }, [activeProjectId]);

    const activeProject = useMemo(
        () => projects.find((p) => p._id === activeProjectId) || null,
        [projects, activeProjectId]
    );

    const tasksWithUiStatus = useMemo(
        () => (tasks || []).map((t) => ({ ...t, uiStatus: normalizeStatusForColumns(t.status) })),
        [tasks]
    );

    const filteredTasks = useMemo(() => {
        const { startOfToday, endOfToday, startOfWeek, endOfWeek } = getDateRangeAnchors(new Date());

        return tasksWithUiStatus.filter((t) => {
            // Priority (multi)
            const priorityOk = priorityFilters.length === 0 || priorityFilters.includes(t.priority);

            // Assignee (multi)
            const assignedToId = safeId(t?.assignedTo?._id || t?.assignedTo);
            const assigneeOk = assigneeFilters.length === 0 || assigneeFilters.includes(assignedToId);

            // Due (single)
            const rawDue = t?.dueDate;
            const due = rawDue ? new Date(rawDue) : null;

            let dueOk = true;
            if (dueFilter === "NO_DUE_DATE") {
                dueOk = !due;
            } else if (dueFilter === "OVERDUE") {
                // Only overdue if it has a due date and is before today
                dueOk = !!due && due < startOfToday;
            } else if (dueFilter === "TODAY") {
                dueOk = !!due && due >= startOfToday && due < endOfToday;
            } else if (dueFilter === "THIS_WEEK") {
                dueOk = !!due && due >= startOfWeek && due < endOfWeek;
            } else {
                dueOk = true; // ALL
            }

            return priorityOk && assigneeOk && dueOk;
        });
    }, [tasksWithUiStatus, priorityFilters, assigneeFilters, dueFilter]);

    const columnsToTasks = useMemo(() => {
        const map = {
            [STATUS.ASSIGNED]: [],
            [STATUS.IN_PROGRESS]: [],
            [STATUS.COMPLETED]: [],
            [STATUS.INCOMPLETE]: [],
        };

        for (const t of filteredTasks) map[t.uiStatus].push(t);

        for (const k of Object.keys(map)) {
            map[k].sort((a, b) => {
                const ao = a.order ?? 0;
                const bo = b.order ?? 0;
                if (ao !== bo) return ao - bo;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        }

        return map;
    }, [filteredTasks]);

    const togglePriority = (p) => {
        setPriorityFilters((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
    };

    const toggleAssignee = (id) => {
        setAssigneeFilters((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const clearFilters = () => {
        setPriorityFilters([]);
        setAssigneeFilters([]);
        setDueFilter("ALL");
    };

    const filtersActive =
        priorityFilters.length > 0 || assigneeFilters.length > 0 || dueFilter !== "ALL";

    // ✅ CREATE TASK (WORKING):
    // CreateTaskModal always calls onCreate(projectId, payload) and already converts dueDate to ISO. (but we still guard)
    const onCreateTask = async (projectId, payload) => {
        if (!projectId) {
            toast.error("Project is required.");
            return;
        }

        try {
            setCreating(true);

            // Defensive validation (modal also validates)
            const title = payload?.title?.trim?.() || "";
            if (!title) {
                toast.error("Task title is required.");
                return;
            }
            if (!payload?.dueDate) {
                toast.error("Due date is required.");
                return;
            }

            const normalizedPayload = {
                ...payload,
                title,
                // ensure ISO if something slips through
                dueDate: payload?.dueDate ? new Date(payload.dueDate).toISOString() : undefined,
            };

            const res = await taskService.createTask(projectId, normalizedPayload);

            if (res?.success) {
                toast.success("Task created");
                setCreateOpen(false);
                await fetchBoardData(projectId);
            } else {
                toast.error(res?.error || "Failed to create task");
            }
        } catch (e) {
            console.error("Error creating task:", e);
            toast.error(e?.response?.data?.error || e?.message || "Failed to create task");
        } finally {
            setCreating(false);
        }
    };

    const findTask = (id) => tasksWithUiStatus.find((t) => t._id === id) || null;

    const findContainer = (id) => {
        if (COLUMNS.some((c) => c.id === id)) return id;
        const t = findTask(id);
        return t ? t.uiStatus : null;
    };

    const setTaskLocal = (taskId, patch) => {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, ...patch } : t)));
    };

    const persistTaskMove = async (taskId, nextStatus, nextOrder) => {
        try {
            await taskService.updateTask(taskId, { status: nextStatus, order: nextOrder });
        } catch (e) {
            console.error(e);
            toast.error("Failed to update task");
        }
    };

    const onDragStart = (event) => setActiveId(event.active.id);

    const onDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;
        lastOverId.current = over.id;

        const activeTaskId = active.id;
        const overId = over.id;

        const activeContainer = findContainer(activeTaskId);
        const overContainer = findContainer(overId);
        if (!activeContainer || !overContainer) return;
        if (activeContainer === overContainer) return;

        setTaskLocal(activeTaskId, { status: overContainer });
    };

    const onDragEnd = async (event) => {
        const { active, over } = event;
        const activeTaskId = active.id;
        const overId = over?.id || lastOverId.current;
        setActiveId(null);
        lastOverId.current = null;
        if (!overId) return;

        const toCol = findContainer(overId);
        if (!toCol) return;

        const toTasks = columnsToTasks[toCol] || [];
        const isOverColumn = COLUMNS.some((c) => c.id === overId);
        const overIndex = isOverColumn ? toTasks.length : toTasks.findIndex((t) => t._id === overId);

        const before = toTasks[overIndex - 1];
        const after = toTasks[overIndex];

        let nextOrder = 0;
        if (!before && !after) nextOrder = 1000;
        else if (before && !after) nextOrder = (before.order ?? 0) + 1000;
        else if (!before && after) nextOrder = (after.order ?? 0) - 1000;
        else nextOrder = Math.floor(((before.order ?? 0) + (after.order ?? 0)) / 2);

        const nextStatus = toCol;

        setTasks((prev) => {
            const next = [...prev];
            const idx = next.findIndex((t) => t._id === activeTaskId);
            if (idx === -1) return prev;
            next[idx] = { ...next[idx], status: nextStatus, order: nextOrder };
            return next;
        });

        await persistTaskMove(activeTaskId, nextStatus, nextOrder);
    };

    const activeTask = activeId ? findTask(activeId) : null;

    const FiltersPopover = () => {
        if (!filtersOpen) return null;

        return (
            <div className="absolute left-0 top-12 z-50 w-[340px] rounded-xl border border-border-default bg-bg-surface shadow-large p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-text-primary">Filters</div>
                    <button
                        type="button"
                        className="text-sm text-text-secondary hover:text-text-primary cursor-pointer"
                        onClick={() => setFiltersOpen(false)}
                    >
                        Done
                    </button>
                </div>

                {/* Priority (multi) */}
                <div className="mb-4">
                    <div className="text-xs font-semibold text-text-muted mb-2">Priority</div>
                    <div className="flex flex-col gap-2">
                        {["High", "Medium", "Low"].map((p) => (
                            <label key={p} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                                <input type="checkbox" checked={priorityFilters.includes(p)} onChange={() => togglePriority(p)} />
                                <span>{p}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Assignees (multi) */}
                <div className="mb-4">
                    <div className="text-xs font-semibold text-text-muted mb-2">Assignees</div>
                    <div className="max-h-[150px] overflow-auto pr-1 flex flex-col gap-2">
                        {members.map((m) => {
                            const id = safeId(m?.memberId?._id || m?.memberId || m?._id);
                            const label = m?.memberId?.name || m?.memberId?.email || m?.name || m?.email || "Member";
                            if (!id) return null;
                            return (
                                <label key={id} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                                    <input type="checkbox" checked={assigneeFilters.includes(id)} onChange={() => toggleAssignee(id)} />
                                    <span>{label}</span>
                                </label>
                            );
                        })}
                        {members.length === 0 ? <div className="text-sm text-text-muted">No members found.</div> : null}
                    </div>
                </div>

                {/* Due date (single) */}
                <div className="mb-4">
                    <div className="text-xs font-semibold text-text-muted mb-2">Due date</div>
                    <select
                        value={dueFilter}
                        onChange={(e) => setDueFilter(e.target.value)}
                        className="w-full rounded-lg border border-border-default bg-bg-main px-3 py-2 text-sm text-text-primary outline-none"
                    >
                        <option value="ALL">All</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="TODAY">Due Today</option>
                        <option value="THIS_WEEK">Due This Week</option>
                        <option value="NO_DUE_DATE">No Due Date</option>
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        className="px-3 py-2 rounded-lg border border-border-default bg-bg-main text-sm text-text-secondary hover:text-text-primary cursor-pointer"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>
                    <div className="text-xs text-text-muted">{filtersActive ? "Active" : "None"}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full p-2 bg-bg-main">
            <div className="mb-8 max-w-full">
                <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Task Board</h1>
                        <p className="text-base text-text-secondary mb-2">Drag and drop tasks to update their status</p>
                        {activeProject ? (
                            <p className="text-sm text-text-muted">
                                Project: <span className="text-text-secondary">{activeProject.name}</span>
                            </p>
                        ) : null}
                    </div>

                    {projects.length > 1 ? (
                        <div className="min-w-[260px]">
                            <select
                                value={activeProjectId}
                                onChange={(e) => setActiveProjectId(e.target.value)}
                                className="w-full rounded-xl border border-border-default bg-bg-surface px-4 py-3 text-text-primary outline-none focus:border-border-hover"
                            >
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : null}
                </div>

                <div className="relative flex gap-3 flex-wrap items-center">
                    <button
                        type="button"
                        className="flex items-center gap-2 px-5 py-2.5 bg-bg-surface border border-border-default rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-surface-hover hover:border-border-hover hover:text-text-primary transition-all duration-200 cursor-pointer"
                        onClick={() => setFiltersOpen((v) => !v)}
                    >
                        <MdFilterList size={18} />
                        <span>Filters</span>
                        {filtersActive ? (
                            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-bg-surface-hover border border-border-default">
                                Active
                            </span>
                        ) : null}
                    </button>

                    <FiltersPopover />

                    <button
                        type="button"
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-text-on-accent rounded-xl text-sm font-semibold shadow-medium hover:-translate-y-0.5 hover:shadow-large transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => setCreateOpen(true)}
                        disabled={!activeProjectId || creating}
                        title={!activeProjectId ? "Select a project first" : "Create a new task"}
                    >
                        <MdAdd size={18} />
                        <span>{creating ? "Creating..." : "Create New Task"}</span>
                    </button>
                </div>
            </div>

            {/* ✅ IMPORTANT: CreateTaskModal uses isOpen (not open) */}
            <CreateTaskModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreate={onCreateTask}
                projects={projects}
                members={members}
                defaultProjectId={activeProjectId}
            />

            {loading ? (
                <div className="text-text-secondary px-2">Loading...</div>
            ) : !activeProjectId ? (
                <div className="text-text-secondary px-2">Create a project first, then come back here.</div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                >
                    <SortableContext items={COLUMNS.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex gap-5 overflow-x-auto pb-5 max-w-full">
                            {COLUMNS.map((col) => (
                                <TaskColumn key={col.id} column={col} tasks={columnsToTasks[col.id] || []} />
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay>
                        {activeTask ? (
                            <div className="w-[300px]">
                                <TaskCard task={activeTask} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
}