import { useEffect, useMemo, useState } from "react";
import { PRIORITIES, STATUS } from "./taskUtils";

const STATUS_OPTIONS = [
    { label: "Unassigned", value: "UnAssigned" },
    { label: "Assigned", value: STATUS.ASSIGNED },
    { label: "In Progress", value: STATUS.IN_PROGRESS },
    { label: "Completed", value: STATUS.COMPLETED },
    { label: "Incomplete", value: STATUS.INCOMPLETE },
];

export default function CreateTaskModal({
    open,
    onClose,
    projects,
    members,
    defaultProjectId,
    onCreate,
    busy,
}) {
    const [projectId, setProjectId] = useState(defaultProjectId || "");
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [assignedTo, setAssignedTo] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("UnAssigned");

    useEffect(() => {
        if (!open) return;
        setProjectId(defaultProjectId || "");
        setTitle("");
        setPriority("Medium");
        setAssignedTo("");
        setDueDate("");
        setStatus("UnAssigned");
    }, [open, defaultProjectId]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const activeMembers = useMemo(
        () => (members || []).filter((m) => m?.memberId && m?.isActive !== false),
        [members]
    );

    if (!open) return null;

    const submit = async (e) => {
        e.preventDefault();
        if (!projectId || !title.trim()) return;

        const payload = {
            title: title.trim(),
            priority,
            assignedTo: assignedTo || undefined,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            status,
        };

        await onCreate?.(projectId, payload);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => (busy ? null : onClose?.())} />

            <div className="relative w-[680px] max-w-[92vw] bg-bg-surface rounded-2xl shadow-large border border-border-default p-8">
                <button
                    type="button"
                    className="absolute right-6 top-6 text-text-muted hover:text-text-primary text-2xl"
                    onClick={() => (busy ? null : onClose?.())}
                    aria-label="Close"
                >
                    ×
                </button>

                <h2 className="text-2xl font-bold text-text-primary mb-6">Create New Task</h2>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Project <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="w-full rounded-xl border border-border-default bg-bg-main px-4 py-3 text-text-primary outline-none focus:border-border-hover"
                            required
                        >
                            <option value="" disabled>Select a project</option>
                            {projects.map((p) => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title"
                            className="w-full rounded-xl border border-border-default bg-bg-main px-4 py-3 text-text-primary outline-none focus:border-border-hover"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Priority <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full rounded-xl border border-border-default bg-bg-main px-4 py-3 text-text-primary outline-none focus:border-border-hover"
                            required
                        >
                            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Assignee <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full rounded-xl border border-border-default bg-bg-main px-4 py-3 text-text-primary outline-none focus:border-border-hover"
                            required
                        >
                            <option value="">Select assignee</option>
                            {activeMembers.map((m) => (
                                <option key={String(m.memberId._id)} value={String(m.memberId._id)}>
                                    {m.memberId.name || m.memberId.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Due Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full rounded-xl border border-border-default bg-bg-main px-4 py-3 text-text-primary outline-none focus:border-border-hover"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-xl border border-border-default bg-bg-main px-4 py-3 text-text-primary outline-none focus:border-border-hover"
                            required
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-6 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            className="w-1/2 px-5 py-3 rounded-xl border border-border-default bg-bg-surface text-text-primary font-semibold hover:bg-bg-surface-hover"
                            onClick={() => (busy ? null : onClose?.())}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={busy}
                            className="w-1/2 px-5 py-3 rounded-xl bg-accent-primary text-text-on-accent font-semibold shadow-medium hover:-translate-y-0.5 hover:shadow-large transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {busy ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}