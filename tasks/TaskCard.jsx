import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdCalendarToday, MdEdit, MdDragIndicator } from "react-icons/md";
import { formatNiceDate, priorityPillClasses } from "./taskUtils";

export default function TaskCard({ task, onEdit }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    const assignedToName = task?.assignedTo?.name || "";

    const handleEditClick = (e) => {
        // Prevent drag system / parent handlers from eating the click
        e.preventDefault();
        e.stopPropagation();
        onEdit?.(task);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-bg-surface border border-border-default rounded-xl p-4 hover:bg-bg-surface-hover hover:border-border-hover hover:shadow-large hover:-translate-y-0.5 transition-all duration-200 ${isDragging ? "shadow-large" : ""
                }`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3 gap-2">
                <h3 className="text-sm font-semibold text-text-primary flex-1 leading-snug pr-1">
                    {task.title}
                </h3>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Priority pill */}
                    <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${priorityPillClasses(
                            task.priority
                        )}`}
                    >
                        {task.priority || "Low"}
                    </span>

                    {/* Edit button */}
                    <button
                        type="button"
                        onClick={handleEditClick}
                        className="p-1.5 rounded-lg border border-border-default hover:border-border-hover hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition"
                        aria-label="Edit task"
                        title="Edit"
                    >
                        <MdEdit size={16} />
                    </button>

                    {/* Drag handle ONLY (so buttons work) */}
                    <button
                        type="button"
                        className="p-1.5 rounded-lg border border-border-default hover:border-border-hover hover:bg-bg-surface-hover text-text-muted hover:text-text-primary transition cursor-grab active:cursor-grabbing"
                        aria-label="Drag task"
                        title="Drag"
                        {...attributes}
                        {...listeners}
                        onClick={(e) => {
                            // Don’t let a click on the handle trigger any card-level click handlers
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <MdDragIndicator size={18} />
                    </button>
                </div>
            </div>

            {/* Assigned */}
            <div className="mb-3">
                <p className={`text-xs ${assignedToName ? "text-text-secondary" : "text-text-muted"}`}>
                    {assignedToName || "Unassigned"}
                </p>
            </div>

            {/* Due date */}
            <div className="flex items-center gap-1.5 pt-3 border-t border-border-default">
                <MdCalendarToday size={14} className="text-text-muted" />
                <span className="text-xs text-text-secondary">
                    {formatNiceDate(task.dueDate || task.dateAssigned || task.createdAt)}
                </span>
            </div>
        </div>
    );
}