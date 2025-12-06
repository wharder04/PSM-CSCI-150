// src/components/ProjectMembers.jsx

import { useEffect, useState } from "react";
import { projectService } from "../services/api";

export default function ProjectMembers({ projectId }) {
    const [members, setMembers] = useState([]);
    const [emailInput, setEmailInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const loadMembers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.listMembers(projectId);
            setMembers(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!projectId) return;
        loadMembers();
    }, [projectId]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!emailInput.trim()) return;

        try {
            setSaving(true);
            setError(null);
            await projectService.addMember(projectId, emailInput.trim());
            setEmailInput("");
            await loadMembers();
        } catch (err) {
            console.error(err);
            setError("Could not add member (check email)");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (member) => {
        try {
            await projectService.toggleMemberStatus(projectId, member.memberId._id);
            await loadMembers();
        } catch (err) {
            console.error(err);
            setError("Could not update member status");
        }
    };

    const handleRemove = async (member) => {
        if (!window.confirm("Remove this member from the project?")) return;
        try {
            await projectService.removeMember(projectId, member.memberId._id);
            await loadMembers();
        } catch (err) {
            console.error(err);
            setError("Could not remove member");
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Project Members</h2>
                <p className="text-sm text-gray-500">
                    Add teammates by email and manage their access.
                </p>
            </div>

            {/* Add member form */}
            <form onSubmit={handleAddMember} className="flex gap-2">
                <input
                    type="email"
                    className="flex-1 border rounded px-2 py-1 text-sm"
                    placeholder="Enter teammate's email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-50 cursor-pointer"
                >
                    {saving ? "Adding..." : "Add"}
                </button>
            </form>

            {error && <div className="text-sm text-red-500">{error}</div>}

            {loading ? (
                <div className="text-sm text-gray-500">Loading members...</div>
            ) : members.length === 0 ? (
                <div className="text-sm text-gray-500">No members yet.</div>
            ) : (
                <ul className="divide-y border rounded bg-white">
                    {members.map((m) => (
                        <li
                            key={m._id}
                            className="flex items-center justify-between px-3 py-2 text-sm"
                        >
                            <div>
                                <div className="font-medium">
                                    {m.memberId?.name || "Unknown user"}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {m.memberId?.email}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${m.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-200 text-gray-600"
                                        }`}
                                >
                                    {m.isActive ? "Active" : "Inactive"}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handleToggle(m)}
                                    className="text-xs px-2 py-1 border rounded cursor-pointer"
                                >
                                    {m.isActive ? "Deactivate" : "Activate"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleRemove(m)}
                                    className="text-xs px-2 py-1 border rounded text-red-600 border-red-400 cursor-pointer"
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
