import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    MdCalendarToday,
    MdEdit,
    MdDragIndicator,
    MdComment,
    MdLock,
    MdPersonOutline,
    MdOutlineCheckCircle,
} from "react-icons/md";
import { formatNiceDate, isTaskOverdue, priorityPillClasses } from "./taskUtils";

export default function TaskCard({
    task,
    onEdit,
    onComment,
    canDrag = false,
    isAssignedToCurrentUser = false,
    canEditTask = true,
}) {
    if (!task || !task._id) return null;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: String(task._id),
        disabled: !canDrag,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
    };

    const assignedToName = task?.assignedTo?.name || "";
    const commentCount = Array.isArray(task?.comments) ? task.comments.length : 0;
    const overdue = isTaskOverdue(task);
    const isUnassigned = !task?.assignedTo?._id && !task?.assignedTo;

    const lockedReason = isUnassigned
        ? "Assign this task before it can move"
        : isAssignedToCurrentUser
            ? ""
            : "Only the assigned user can move this task";

    const stopAndRun = (fn, e) => {
        e.preventDefault();
        e.stopPropagation();
        fn?.(task);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-2xl border bg-bg-surface px-4 py-4 shadow-soft transition-all duration-200 ${overdue
                    ? "border-red-300 bg-red-50/20"
                    : "border-border-default hover:border-border-hover hover:shadow-large"
                } ${isDragging ? "shadow-large" : ""}`}
        >
            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-semibold leading-snug text-text-primary">
                        {task.title || "Untitled Task"}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${priorityPillClasses(
                                task.priority
                            )}`}
                        >
                            {task.priority || "Low"}
                        </span>

                        {isUnassigned ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                                <MdLock size={12} />
                                Unassigned
                            </span>
                        ) : isAssignedToCurrentUser ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                                <MdOutlineCheckCircle size={12} />
                                Yours
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={(e) => stopAndRun(onComment, e)}
                        className="inline-flex items-center justify-center rounded-xl border border-border-default bg-bg-main p-2 text-text-secondary transition hover:border-border-hover hover:text-text-primary"
                        title="Comments"
                    >
                        <MdComment size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            if (!canEditTask) return;
                            stopAndRun(onEdit, e);
                        }}
                        disabled={!canEditTask}
                        className="inline-flex items-center justify-center rounded-xl border border-border-default bg-bg-main p-2 text-text-secondary transition hover:border-border-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        title={canEditTask ? "Edit task" : "You are not allowed to edit tasks"}
                    >
                        <MdEdit size={16} />
                    </button>

                    <button
                        type="button"
                        className={`inline-flex items-center justify-center rounded-xl border p-2 transition ${canDrag
                                ? "cursor-grab border-border-default bg-bg-main text-text-secondary hover:border-border-hover hover:text-text-primary active:cursor-grabbing"
                                : "cursor-not-allowed border-border-default bg-bg-main text-text-muted"
                            }`}
                        title={canDrag ? "Drag task" : lockedReason}
                        {...(canDrag ? attributes : {})}
                        {...(canDrag ? listeners : {})}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        {canDrag ? <MdDragIndicator size={18} /> : <MdLock size={16} />}
                    </button>
                </div>
            </div>

            <div className="grid gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <MdPersonOutline className="text-text-muted" size={15} />
                    <span className={assignedToName ? "text-text-secondary" : "text-text-muted"}>
                        {assignedToName || "No assignee"}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border-default pt-3">
                    <div className="flex items-center gap-2 text-sm">
                        <MdCalendarToday className={overdue ? "text-red-500" : "text-text-muted"} size={14} />
                        <span className={overdue ? "font-medium text-red-600" : "text-text-secondary"}>
                            {formatNiceDate(task.dueDate || task.createdAt)}
                        </span>
                    </div>

                    <span className="text-xs text-text-muted">
                        {commentCount} comment{commentCount === 1 ? "" : "s"}
                    </span>
                </div>
            </div>
        </div>
    );
}
