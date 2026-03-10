import React, { useEffect, useRef } from "react";

export default function FilterPopover({
    open,
    onClose,

    // existing filters
    priorities = ["High", "Medium", "Low"],
    assignees = [], // array of { _id, name, email }
    selectedPriorities = [],
    setSelectedPriorities,
    selectedAssignees = [],
    setSelectedAssignees,

    // due date filter
    dueDateFilter = "any",
    setDueDateFilter,
    dueDateRange = { from: "", to: "" },
    setDueDateRange,

    onClear,
}) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };

        const onClickOutside = (e) => {
            if (!panelRef.current) return;
            if (!panelRef.current.contains(e.target)) onClose?.();
        };

        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClickOutside);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClickOutside);
        };
    }, [open, onClose]);

    const toggleInList = (value, list, setter) => {
        if (!setter) return;
        if (list.includes(value)) setter(list.filter((x) => x !== value));
        else setter([...list, value]);
    };

    if (!open) return null;

    return (
        <div
            ref={panelRef}
            className="absolute left-0 mt-3 w-96 bg-white border border-gray-200 rounded-xl shadow-lg p-6 z-50"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filter Tasks</h2>
                <div className="flex items-center gap-3">
                    {onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm text-gray-500 hover:text-gray-800"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Priority */}
            <div className="mb-5">
                <div className="text-sm font-semibold text-gray-800 mb-2">Priority</div>
                <div className="space-y-2">
                    {priorities.map((p) => (
                        <label key={p} className="flex items-center gap-2 text-gray-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedPriorities.includes(p)}
                                onChange={() => toggleInList(p, selectedPriorities, setSelectedPriorities)}
                            />
                            <span>{p}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Assignee */}
            <div className="mb-5">
                <div className="text-sm font-semibold text-gray-800 mb-2">Assignee</div>
                <div className="max-h-48 overflow-auto pr-2 space-y-2">
                    {assignees.map((u) => {
                        const label = u?.name || u?.email || "Unknown";
                        return (
                            <label key={u._id} className="flex items-center gap-2 text-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedAssignees.includes(u._id)}
                                    onChange={() => toggleInList(u._id, selectedAssignees, setSelectedAssignees)}
                                />
                                <span>{label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Due Date */}
            <div>
                <div className="text-sm font-semibold text-gray-800 mb-2">Due Date</div>

                <div className="space-y-2 text-sm text-gray-800">
                    {[
                        { key: "any", label: "Any" },
                        { key: "overdue", label: "Overdue" },
                        { key: "today", label: "Due Today" },
                        { key: "week", label: "Due This Week" },
                        { key: "month", label: "Due This Month" },
                        { key: "none", label: "No Due Date" },
                        { key: "range", label: "Custom Range" },
                    ].map((opt) => (
                        <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="dueDateFilter"
                                checked={dueDateFilter === opt.key}
                                onChange={() => setDueDateFilter?.(opt.key)}
                            />
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>

                {dueDateFilter === "range" && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">From</div>
                            <input
                                type="date"
                                value={dueDateRange?.from || ""}
                                onChange={(e) => setDueDateRange?.((p) => ({ ...(p || {}), from: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900 [color-scheme:light]"
                            />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">To</div>
                            <input
                                type="date"
                                value={dueDateRange?.to || ""}
                                onChange={(e) => setDueDateRange?.((p) => ({ ...(p || {}), to: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900 [color-scheme:light]"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}