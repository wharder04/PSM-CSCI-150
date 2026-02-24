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
import FilterPopover from "../../components/tasks/FilterPopover.jsx";
import TaskColumn from "../../components/tasks/TaskColumn.jsx";
import TaskCard from "../../components/tasks/TaskCard.jsx";
import { COLUMNS, STATUS } from "../../components/tasks/taskUtils.js";

function normalizeStatusForColumns(status) {
  if (status === STATUS.IN_PROGRESS) return STATUS.IN_PROGRESS;
  if (status === STATUS.COMPLETED) return STATUS.COMPLETED;
  if (status === STATUS.INCOMPLETE) return STATUS.INCOMPLETE;
  return STATUS.ASSIGNED;
}

export default function TaskBoard() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [members, setMembers] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priorityFilters, setPriorityFilters] = useState([]);
  const [assigneeFilters, setAssigneeFilters] = useState([]);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // DnD
  const [activeId, setActiveId] = useState(null);
  const lastOverId = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await projectService.myProjects();
        const list = [...(res?.data?.owner || []), ...(res?.data?.memberOf || [])];
        setProjects(list);
        if (list.length && !activeProjectId) setActiveProjectId(list[0]._id);
      } catch {
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeProjectId) return;
    (async () => {
      try {
        setLoading(true);
        const [tasksRes, membersRes] = await Promise.all([
          taskService.listTasks(activeProjectId),
          projectService.listMembers(activeProjectId),
        ]);
        setTasks(tasksRes?.data || []);
        setMembers(membersRes?.data || []);
      } catch {
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    })();
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
    return tasksWithUiStatus.filter((t) => {
      const priorityOk = priorityFilters.length === 0 || priorityFilters.includes(t.priority);
      const assignedToId = t?.assignedTo?._id ? String(t.assignedTo._id) : "";
      const assigneeOk = assigneeFilters.length === 0 || assigneeFilters.includes(assignedToId);
      return priorityOk && assigneeOk;
    });
  }, [tasksWithUiStatus, priorityFilters, assigneeFilters]);

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
  };

  const onCreateTask = async (projectId, payload) => {
    try {
      setCreating(true);
      const res = await taskService.createTask(projectId, payload);
      const created = res?.data;
      if (projectId === activeProjectId) setTasks((prev) => [created, ...prev]);
      toast.success("Task created");
      setCreateOpen(false);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to create task");
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
    } catch {
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

    const fromCol = findContainer(activeTaskId);
    const toCol = findContainer(overId);
    if (!fromCol || !toCol) return;

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
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="relative flex gap-3 flex-wrap">
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 bg-bg-surface border border-border-default rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-surface-hover hover:border-border-hover hover:text-text-primary transition-all duration-200 cursor-pointer"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <MdFilterList size={18} />
            <span>Filters</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-text-on-accent rounded-xl text-sm font-semibold shadow-medium hover:-translate-y-0.5 hover:shadow-large transition-all duration-200 cursor-pointer"
            onClick={() => setCreateOpen(true)}
          >
            <MdAdd size={18} />
            <span>Create New Task</span>
          </button>

          <FilterPopover
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            members={members}
            selectedPriorities={priorityFilters}
            selectedAssignees={assigneeFilters}
            onTogglePriority={togglePriority}
            onToggleAssignee={toggleAssignee}
            onClear={clearFilters}
          />
        </div>
      </div>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projects={projects}
        members={members}
        defaultProjectId={activeProjectId}
        onCreate={onCreateTask}
        busy={creating}
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
