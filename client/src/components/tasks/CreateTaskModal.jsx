import { useEffect, useMemo, useState } from "react";

function formatDateInput(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
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
    const [form, setForm] = useState({
        projectId: defaultProjectId || "",
        title: "",
        desc: "",
        priority: "Medium",
        assignedTo: "",
        dueDate: "",
    });

    const [error, setError] = useState("");
    const isEdit = !!initialTask;

    const memberOptions = useMemo(() => {
        return (members || [])
            .map((m) => ({
                _id: m?.memberId?._id || m?._id || m?.memberId || "",
                name: m?.memberId?.name || m?.name || "",
                email: m?.memberId?.email || m?.email || "",
                isActive: m?.isActive ?? true,
            }))
            .filter((m) => !!m._id && m.isActive);
    }, [members]);

    useEffect(() => {
        if (!isOpen) return;

        if (initialTask) {
            setForm({
                projectId:
                    initialTask?.projectId?._id ||
                    initialTask?.projectId ||
                    defaultProjectId ||
                    "",
                title: initialTask?.title || "",
                desc: initialTask?.desc || "",
                priority: initialTask?.priority || "Medium",
                assignedTo: initialTask?.assignedTo?._id || "",
                dueDate: formatDateInput(initialTask?.dueDate),
            });
        } else {
            setForm({
                projectId: defaultProjectId || "",
                title: "",
                desc: "",
                priority: "Medium",
                assignedTo: "",
                dueDate: "",
            });
        }

        setError("");
    }, [isOpen, initialTask, defaultProjectId]);

    if (!isOpen) return null;

    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.projectId) {
            setError("Project is required.");
            return;
        }

        if (!form.title.trim()) {
            setError("Task title is required.");
            return;
        }

        if (!form.dueDate) {
            setError("Due date is required.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            desc: form.desc?.trim() || "",
            priority: form.priority,
            assignedTo: form.assignedTo === "" ? null : form.assignedTo,
            dueDate: new Date(form.dueDate).toISOString(),
        };

        try {
            if (isEdit) {
                await onUpdate?.(initialTask._id, payload);
            } else {
                await onCreate?.(form.projectId, payload);
            }
        } catch (err) {
            console.error("CreateTaskModal submit error:", err);
            setError(err?.response?.data?.error || err?.message || "Failed to save task.");
        }
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
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {isEdit ? "Edit Task" : "Create Task"}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Fill in the task details below.
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

                <div className="px-8 py-7">
                    {error ? (
                        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="grid gap-5">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-700">Project</label>
                            <select
                                value={form.projectId}
                                onChange={(e) => updateField("projectId", e.target.value)}
                                disabled={isEdit}
                                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Select project</option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-700">Task title</label>
                            <input
                                value={form.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder="Enter task title"
                                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={form.desc}
                                onChange={(e) => updateField("desc", e.target.value)}
                                rows={4}
                                placeholder="Write a short description"
                                className="resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Priority</label>
                                <select
                                    value={form.priority}
                                    onChange={(e) => updateField("priority", e.target.value)}
                                    className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Assignee</label>
                                <select
                                    value={form.assignedTo}
                                    onChange={(e) => updateField("assignedTo", e.target.value)}
                                    className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                                >
                                    <option value="">Unassigned</option>
                                    {memberOptions.map((member) => (
                                        <option key={member._id} value={member._id}>
                                            {member.name || member.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-gray-700">Due date</label>
                                <input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={(e) => updateField("dueDate", e.target.value)}
                                    className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 [color-scheme:light]"
                                />
                            </div>
                        </div>

                        <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                {isEdit ? "Save Changes" : "Create Task"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}