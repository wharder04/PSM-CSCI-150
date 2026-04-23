import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard.jsx";

export default function TaskColumn({
    column,
    tasks = [],
    onEditTask,
    onCommentTask,
    canDragTask,
    isAssignedToCurrentUser,
    canEditTask,
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: String(column.id),
    });

    const safeTasks = Array.isArray(tasks)
        ? tasks.filter((task) => task && task._id)
        : [];

    return (
        <section
            ref={setNodeRef}
            className={`w-[320px] shrink-0 rounded-3xl border bg-bg-surface px-5 py-5 shadow-soft transition ${isOver
                    ? "border-border-hover ring-2 ring-border-hover/40"
                    : "border-border-default"
                }`}
        >
            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">{column.title}</h3>
                    <p className="mt-1 text-xs text-text-muted">{column.description}</p>
                </div>

                <span className="inline-flex min-w-[34px] items-center justify-center rounded-full border border-border-default bg-bg-main px-3 py-1 text-xs font-semibold text-text-secondary">
                    {safeTasks.length}
                </span>
            </div>

            <SortableContext
                items={safeTasks.map((task) => String(task._id))}
                strategy={verticalListSortingStrategy}
            >
                <div className="min-h-[220px] space-y-3">
                    {safeTasks.length > 0 ? (
                        safeTasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onEdit={onEditTask}
                                onComment={onCommentTask}
                                canDrag={canDragTask(task)}
                                isAssignedToCurrentUser={isAssignedToCurrentUser(task)}
                                canEditTask={canEditTask}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-border-default bg-bg-main px-4 py-10 text-center">
                            <p className="text-sm text-text-muted">No tasks in this column</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </section>
    );
}
