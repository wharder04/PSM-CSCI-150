import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    MdCalendarToday,
    MdEdit,
    MdDragIndicator,
    MdComment,
} from "react-icons/md";
import { formatNiceDate, priorityPillClasses } from "./taskUtils";

export default function TaskCard({ task, onEdit, onComment }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    const assignedToName = task?.assignedTo?.name || "";
    const commentCount = Array.isArray(task?.comments) ? task.comments.length : 0;

    const stopAndRun = (fn, e) => {
        e.preventDefault();
        e.stopPropagation();
        fn?.(task);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-bg-surface border border-border-default rounded-xl p-4 hover:bg-bg-surface-hover hover:border-border-hover hover:shadow-large hover:-translate-y-0.5 transition-all duration-200 ${isDragging ? "shadow-large" : ""
                }`}
        >
            <div className="flex justify-between items-start mb-3 gap-2">
                <h3 className="text-sm font-semibold text-text-primary flex-1 leading-snug pr-1">
                    {task.title}
                </h3>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${priorityPillClasses(
                            task.priority
                        )}`}
                    >
                        {task.priority || "Low"}
                    </span>

                    <button
                        type="button"
                        onClick={(e) => stopAndRun(onEdit, e)}
                        className="p-1.5 rounded-lg border border-border-default hover:border-border-hover hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition"
                        aria-label="Edit task"
                        title="Edit"
                    >
                        <MdEdit size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => stopAndRun(onComment, e)}
                        className="flex items-center gap-1 p-1.5 rounded-lg border border-border-default hover:border-border-hover hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition"
                        aria-label="Comment on task"
                        title="Comment"
                    >
                        <MdComment size={16} />
                        {commentCount > 0 ? (
                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-accent-primary text-text-on-accent text-[10px] font-bold flex items-center justify-center">
                                {commentCount}
                            </span>
                        ) : null}
                    </button>

                    <button
                        type="button"
                        className="p-1.5 rounded-lg border border-border-default hover:border-border-hover hover:bg-bg-surface-hover text-text-muted hover:text-text-primary transition cursor-grab active:cursor-grabbing"
                        aria-label="Drag task"
                        title="Drag"
                        {...attributes}
                        {...listeners}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <MdDragIndicator size={18} />
                    </button>
                </div>
            </div>

            <div className="mb-3">
                <p className={`text-xs ${assignedToName ? "text-text-secondary" : "text-text-muted"}`}>
                    {assignedToName || "Unassigned"}
                </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border-default gap-3">
                <div className="flex items-center gap-1.5">
                    <MdCalendarToday size={14} className="text-text-muted" />
                    <span className="text-xs text-text-secondary">
                        {formatNiceDate(task.dueDate || task.dateAssigned || task.createdAt)}
                    </span>
                </div>

                {commentCount > 0 ? (
                    <span className="text-[11px] text-text-muted">{commentCount} comment{commentCount === 1 ? "" : "s"}</span>
                ) : null}
            </div>
        </div>
    );
}