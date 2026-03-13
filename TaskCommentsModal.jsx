import { useMemo, useState } from "react";
import { MdClose, MdSend } from "react-icons/md";
import { formatDateTime, formatNiceDate } from "./taskUtils";

export default function TaskCommentsModal({
    isOpen,
    task,
    onClose,
    onAddComment,
    isSaving = false,
}) {
    const [text, setText] = useState("");

    const comments = useMemo(
        () => (Array.isArray(task?.comments) ? [...task.comments].reverse() : []),
        [task]
    );

    if (!isOpen || !task) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const value = text.trim();
        if (!value) return;

        const ok = await onAddComment?.(task._id, value);
        if (ok) {
            setText("");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onMouseDown={onClose}
        >
            <div
                className="w-full max-w-3xl rounded-2xl bg-bg-surface border border-border-default shadow-large max-h-[90vh] flex flex-col"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 p-6 border-b border-border-default">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">{task.title}</h2>
                        <p className="text-sm text-text-secondary mt-1">
                            Due: {formatNiceDate(task.dueDate)}
                        </p>
                        {task.desc ? (
                            <p className="text-sm text-text-secondary mt-3 whitespace-pre-wrap">
                                {task.desc}
                            </p>
                        ) : (
                            <p className="text-sm text-text-muted mt-3">No description added.</p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover"
                    >
                        <MdClose size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-text-primary">Comments</h3>
                        <span className="text-sm text-text-muted">
                            {comments.length} comment{comments.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {comments.length === 0 ? (
                            <div className="rounded-xl border border-border-default bg-bg-main p-4 text-sm text-text-muted">
                                No comments yet.
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div
                                    key={comment._id || `${comment.createdAt}-${comment.text}`}
                                    className="rounded-xl border border-border-default bg-bg-main p-4"
                                >
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div className="text-sm font-semibold text-text-primary">
                                            {comment?.createdBy?.name || comment?.createdBy?.email || "User"}
                                        </div>
                                        <div className="text-xs text-text-muted">
                                            {formatDateTime(comment.createdAt)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-secondary whitespace-pre-wrap">
                                        {comment.text}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 border-t border-border-default">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Add a comment
                    </label>
                    <div className="flex gap-3">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write a comment..."
                            rows={3}
                            className="flex-1 rounded-xl border border-border-default bg-bg-main px-4 py-3 text-sm text-text-primary outline-none resize-none"
                        />
                        <button
                            type="submit"
                            disabled={isSaving || !text.trim()}
                            className="self-end flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-primary text-text-on-accent font-semibold disabled:opacity-60"
                        >
                            <MdSend size={18} />
                            {isSaving ? "Saving..." : "Post"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}