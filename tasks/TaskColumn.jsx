import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard.jsx";

export default function TaskColumn({ column, tasks }) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    return (
        <div
            ref={setNodeRef}
            className={`min-w-[300px] max-w-[300px] bg-bg-surface rounded-2xl p-5 shadow-soft border border-border-default flex flex-col h-fit max-h-[calc(100vh-240px)] ${isOver ? "ring-2 ring-border-hover" : ""}`}
        >
            <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-border-default">
                <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold text-text-primary">{column.title}</span>
                    <span className="bg-bg-surface-hover text-text-secondary px-2.5 py-1 rounded-xl text-xs font-semibold">
                        {tasks.length}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
                <SortableContext
                    id={column.id}
                    items={tasks.map((t) => t._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length > 0 ? (
                        tasks.map((t) => <TaskCard key={t._id} task={t} />)
                    ) : (
                        <div className="text-center py-10 text-text-muted text-sm">
                            No tasks in this column
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}