import { useEffect, useMemo, useRef } from "react";
import { PRIORITIES } from "./taskUtils";

export default function FilterPopover({
    open,
    onClose,
    members,
    selectedPriorities,
    selectedAssignees,
    onTogglePriority,
    onToggleAssignee,
    onClear,
}) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        const onClick = (e) => panelRef.current && !panelRef.current.contains(e.target) && onClose?.();
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClick);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClick);
        };
    }, [open, onClose]);

    const activeMembers = useMemo(
        () => (members || []).filter((m) => m?.memberId && m?.isActive !== false),
        [members]
    );

    if (!open) return null;

    return (
        <div
            ref={panelRef}
            className="absolute left-0 top-14 z-50 w-[360px] bg-bg-surface border border-border-default rounded-2xl shadow-large p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Filter Tasks</h3>
                <button
                    type="button"
                    className="text-sm text-text-secondary hover:text-text-primary"
                    onClick={onClear}
                >
                    Clear
                </button>
            </div>

            <div className="mb-5">
                <p className="text-sm font-semibold text-text-primary mb-3">Priority</p>
                <div className="flex flex-col gap-3">
                    {PRIORITIES.map((p) => (
                        <label key={p} className="flex items-center gap-3 cursor-pointer text-text-primary">
                            <input
                                type="checkbox"
                                checked={selectedPriorities.includes(p)}
                                onChange={() => onTogglePriority(p)}
                                className="h-4 w-4 rounded border-border-default"
                            />
                            <span className="text-sm font-medium">{p}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold text-text-primary mb-3">Assignee</p>
                <div className="max-h-[220px] overflow-y-auto pr-2 flex flex-col gap-3">
                    {activeMembers.length === 0 ? (
                        <p className="text-sm text-text-muted">No members found.</p>
                    ) : (
                        activeMembers.map((m) => {
                            const id = m.memberId?._id;
                            const name = m.memberId?.name || m.memberId?.email || "Member";
                            return (
                                <label key={String(id)} className="flex items-center gap-3 cursor-pointer text-text-primary">
                                    <input
                                        type="checkbox"
                                        checked={selectedAssignees.includes(String(id))}
                                        onChange={() => onToggleAssignee(String(id))}
                                        className="h-4 w-4 rounded border-border-default"
                                    />
                                    <span className="text-sm font-medium">{name}</span>
                                </label>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}