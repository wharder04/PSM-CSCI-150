// src/components/ProjectProgress.jsx

import { useEffect, useState } from "react";
import { projectService } from "../services/api"; // adjust path if needed

export default function ProjectProgress({ projectId }) {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!projectId) return;

        const loadProgress = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await projectService.getProgress(projectId);
                // data = { completed, total, percent }
                setProgress(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load progress");
            } finally {
                setLoading(false);
            }
        };

        loadProgress();
    }, [projectId]);

    if (loading) {
        return <div className="text-sm text-gray-500">Loading progress...</div>;
    }

    if (error) {
        return <div className="text-sm text-red-500">{error}</div>;
    }

    if (!progress) return null;

    const { completed, total, percent } = progress;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-gray-600">
                    {percent}%{" "}
                    <span className="text-xs text-gray-400">
                        ({completed}/{total} tasks)
                    </span>
                </span>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
