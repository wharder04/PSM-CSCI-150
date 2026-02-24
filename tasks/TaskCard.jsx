import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdCalendarToday } from "react-icons/md";
import { formatNiceDate, priorityPillClasses } from "./taskUtils";

export default function TaskCard({ task }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    const assignedToName = task?.assignedTo?.name || "";

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-bg-surface border border-border-default rounded-xl p-4 cursor-grab hover:bg-bg-surface-hover hover:border-border-hover hover:shadow-large hover:-translate-y-0.5 transition-all duration-200 active:cursor-grabbing ${isDragging ? "shadow-large" : ""}`}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-semibold text-text-primary flex-1 leading-snug pr-2">
                    {task.title}
                </h3>
                <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide flex-shrink-0 ${priorityPillClasses(task.priority)}`}
                >
                    {task.priority || "Low"}
                </span>
            </div>

            <div className="mb-3">
                <p className={`text-xs ${assignedToName ? "text-text-secondary" : "text-text-muted"}`}>
                    {assignedToName || "Unassigned"}
                </p>
            </div>

            <div className="flex items-center gap-1.5 pt-3 border-t border-border-default">
                <MdCalendarToday size={14} className="text-text-muted" />
                <span className="text-xs text-text-secondary">
                    {formatNiceDate(task.dueDate || task.dateAssigned || task.createdAt)}
                </span>
            </div>
        </div>
    );
}