import React, { useEffect, useMemo, useState } from "react";

function formatDateInput(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
}

export default function CreateTaskModal({
    isOpen,
    onClose,
    onCreate,
    onUpdate,
    projects = [],
    members = [],
    defaultProjectId = "",
    initialTask = null,
}) {
    const isEdit = !!initialTask;

    const [form, setForm] = useState({
        projectId: defaultProjectId || "",
        title: "",
        desc: "",
        priority: "Medium",
        assignedTo: "",
        dueDate: "",
        status: "UnAssigned",
    });

    const [error, setError] = useState("");

    const memberOptions = useMemo(() => members || [], [members]);

    useEffect(() => {
        if (!isOpen) return;

        if (initialTask) {
            setForm({
                projectId: initialTask.projectId || defaultProjectId || "",
                title: initialTask.title || "",
                desc: initialTask.desc || "",
                priority: initialTask.priority || "Medium",
                assignedTo: initialTask?.assignedTo?._id || "",
                dueDate: formatDateInput(initialTask.dueDate),
                status: initialTask.status || "UnAssigned",
            });
        } else {
            setForm({
                projectId: defaultProjectId || "",
                title: "",
                desc: "",
                priority: "Medium",
                assignedTo: "",
                dueDate: "",
                status: "UnAssigned",
            });
        }

        setError("");
    }, [isOpen, initialTask, defaultProjectId]);

    if (!isOpen) return null;

    const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.projectId) return setError("Project is required.");
        if (!form.title.trim()) return setError("Task title is required.");
        if (!form.dueDate) return setError("Due date is required.");

        const payload = {
            title: form.title.trim(),
            desc: form.desc?.trim() || "",
            priority: form.priority,
            assignedTo: form.assignedTo || null,
            dueDate: new Date(form.dueDate).toISOString(),
            status: form.status || "UnAssigned",
        };

        if (isEdit) {
            await onUpdate?.(initialTask._id, payload);
        } else {
            await onCreate?.(form.projectId, payload);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onMouseDown={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-[900px] max-w-[95vw] p-10"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-semibold text-gray-900">
                        {isEdit ? "Edit Task" : "Create New Task"}
                    </h2>
                    <button className="text-gray-500 hover:text-gray-800 text-3xl" onClick={onClose}>
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-8">
                        <div className="grid grid-cols-5 items-center gap-6">
                            <label className="text-gray-600 text-xl font-light">Project *</label>
                            <select
                                className="col-span-4 border-b border-gray-300 focus:border-blue-500 outline-none text-xl py-3 text-gray-900 bg-transparent"
                                value={form.projectId}
                                onChange={(e) => update("projectId", e.target.value)}
                                required
                                disabled={isEdit}
                            >
                                <option value="" disabled>
                                    Select project
                                </option>
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-5 items-center gap-6">
                            <label className="text-gray-600 text-xl font-light">Task Title *</label>
                            <input
                                className="col-span-4 border-b border-gray-300 focus:border-blue-500 outline-none text-xl py-3 text-gray-900 bg-transparent"
                                placeholder="Enter task title"
                                value={form.title}
                                onChange={(e) => update("title", e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-5 items-center gap-6">
                            <label className="text-gray-600 text-xl font-light">Description</label>
                            <textarea
                                className="col-span-4 border-b border-gray-300 focus:border-blue-500 outline-none text-xl py-3 text-gray-900 bg-transparent resize-none"
                                placeholder="Enter task description"
                                value={form.desc}
                                onChange={(e) => update("desc", e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-5 items-center gap-6">
                            <label className="text-gray-600 text-xl font-light">Priority *</label>
                            <select
                                className="col-span-4 border-b border-gray-300 focus:border-blue-500 outline-none text-xl py-3 text-gray-900 bg-transparent"
                                value={form.priority}
                                onChange={(e) => update("priority", e.target.value)}
                                required
                            >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-5 items-center gap-6">
                            <label className="text-gray-600 text-xl font-light">Assignee</label>
                            <select
                                className="col-span-4 border-b border-gray-300 focus:border-blue-500 outline-none text-xl py-3 text-gray-900 bg-transparent"
                                value={form.assignedTo}
                                onChange={(e) => update("assignedTo", e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {memberOptions.map((m) => {
                                    const id = m?._id || m?.memberId?._id || m?.memberId;
                                    const label = m?.name || m?.email || m?.memberId?.name || m?.memberId?.email;
                                    if (!id) return null;

                                    return (
                                        <option key={id} value={id}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="grid grid-cols-5 items-center gap-6">
                            <label className="text-gray-600 text-xl font-light">Due Date *</label>
                            <input
                                type="date"
                                className="col-span-4 border-b border-gray-300 focus:border-blue-500 outline-none text-xl py-3 text-gray-900 bg-transparent [color-scheme:light]"
                                value={form.dueDate}
                                onChange={(e) => update("dueDate", e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-5 items-center gap-6">
                            <label className="text-gray-600 text-xl font-light">Status *</label>
                            <select
                                className="col-span-4 border-b border-gray-300 focus:border-blue-500 outline-none text-xl py-3 text-gray-900 bg-transparent"
                                value={form.status}
                                onChange={(e) => update("status", e.target.value)}
                                required
                            >
                                <option value="UnAssigned">Unassigned</option>
                                <option value="Assigned">Assigned</option>
                                <option value="InProgress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="InComplete">Incomplete</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between gap-6 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-1/2 py-5 text-xl font-medium rounded-2xl bg-red-500 text-white hover:bg-red-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-1/2 py-5 text-xl font-medium rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {isEdit ? "Save Changes" : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}