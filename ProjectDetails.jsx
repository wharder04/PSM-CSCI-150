import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { projectService } from "../services/api";
import ProjectProgress from "../components/ProjectProgress";
import ProjectMembers from "../components/ProjectMembers";

export default function ProjectDetails() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);

    useEffect(() => {
        const load = async () => {
            const res = await projectService.getProject(projectId);
            setProject(res.data);
        };
        load();
    }, [projectId]);

    if (!project) return <div>Loading...</div>;

    return (
        <div className="page-container">
            <h1>{project.name}</h1>
            <p>{project.desc}</p>

            {/* Progress Tracker */}
            <ProjectProgress projectId={projectId} />

            {/* Members */}
            <ProjectMembers projectId={projectId} />

            {/* You can add tasks here as well */}
        </div>
    );
}
