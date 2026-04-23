import { useMemo, useState } from "react";

function formatDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getInitials(name) {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function TaskCommentsModal({
    isOpen,
    onClose,
    task,
    onAddComment,
    saving = false,
}) {
    const [text, setText] = useState("");

    const comments = useMemo(() => {
        return Array.isArray(task?.comments) ? task.comments : [];
    }, [task]);

    if (!isOpen || !task) return null;

    const submit = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;

        const ok = await onAddComment?.(task._id, trimmed);
        if (ok) setText("");
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
            onMouseDown={onClose}
        >
            <div
                className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white shadow-2xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="border-b border-gray-200 px-8 py-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Task Comments</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {task.title || "Untitled Task"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 px-8 py-7">
                    <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        {comments.length > 0 ? (
                            comments.map((comment, index) => {
                                const authorName =
                                    comment?.createdBy?.name || comment?.createdBy?.email || "User";

                                return (
                                    <div
                                        key={comment?._id || `${comment?.createdAt}-${index}`}
                                        className="rounded-2xl border border-gray-200 bg-white p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                                {getInitials(authorName)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {authorName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDateTime(comment?.createdAt)}
                                                    </div>
                                                </div>

                                                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                                                    {comment?.text || ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-10 text-center text-sm text-gray-500">
                                No comments yet.
                            </div>
                        )}
                    </div>

                    <form onSubmit={submit} className="grid gap-3">
                        <textarea
                            rows={4}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write a comment..."
                            className="resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                        />

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving || !text.trim()}
                                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? "Posting..." : "Post Comment"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
