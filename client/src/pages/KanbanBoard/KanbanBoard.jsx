import { useState } from "react";
import tasksData from "../../data/tasks.json";
import projects from "../../data/projects.json";
import teams from "../../data/team.json";

function KanbanBoard () {
    const projDescription = project.description;
    const totalTasks = project.totalTasks;
    const assignedTasks = project.assignedTasks;
    const incompleteTasks = project.incompleteTasks;
    const completedTasks = project.completedTasks;
    const overdueTasks = project.overdueTasks;
    const [project, setProject] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [team, setTeam] = useState([]);
    const [activeSection, setActiveSection] = useState("tasksActive");

    useEffect(() => {
        setProject(projects[2]);
        setTeam(teams);
        setTasks(tasksData);
    })
    
    return (
        <div className="min-h-screen w-full flex flex-col p-10 bg-gray-100 text-black">
            <div className="w-1/3 h-full p-8 flex flex-col">
                <div className="mb-6">
                    <p className="text-2x1 font-semibold text-black bg-gray-200">Project Description</p>
                    <p clasName="text-2x1 text-black bg-gray-200">{projDescription}</p>
                </div>
                <div className="flex flex-row gap-4 mb-6">
                    <div className="bg-gray-200 p-4 w-40 h-32 rounded flex flex-col">
                        <p className="text-black font-semibold text-2x1">Total Tasks</p>
                        <p className="text-black font-semibold text-2x1">{totalTasks}</p>
                    </div>
                    <div className="bg-gray-200 p-4 w-40 h-32 rounded flex flex-col">
                        <p className="text-black font-semibold text-2x1">Assigned Tasks</p>
                        <p className="text-black font-semibold text-2x1">{assignedTasks}</p>
                    </div>
                    <div className="bg-gray-200 p-4 w-40 h-32 rounded flex flex-col">
                        <p className="text-black font-semibold text-2x1">Incomplete Tasks</p>
                        <p className="text-black font-semibold text-2x1">{incompleteTasks}</p>
                    </div>
                    <div className="bg-gray-200 p-4 w-40 h-32 rounded flex flex-col">
                        <p className="text-black font-semibold text-2x1">Completed Tasks</p>
                        <p className="text-black font-semibold text-2x1">{completedTasks}</p>
                    </div>
                    <div className="bg-gray-200 p-4 w-40 h-32 rounded flex flex-col">
                        <p className="text-black font-semibold text-2x1">Overdue Tasks</p>
                        <p className="text-black font-semibold text-2x1">{overdueTasks}</p>
                    </div>
                </div>
                <div className="mb-6">
                    <button className="bg-gray-800 text-white font-sans rounded w-24 h-10 mb-4">+ New Task</button>
                </div>
                <div>
                    <p className="text-base text-black">Overall Progress</p>
                </div>
            </div>
            <div className="w-2/3 h-full flex flex-col gap-6 p-6">
                <div className="flex flex-row gap-4 mb-4">
                    <button className="bg-gray-200 text-black rounded px-2 py-2 text-base w-24 h-10" onClick={() => setActiveSection("tasksActive")}>Tasks</button>
                    <button className="bg-gray-200 text-black rounded px-2 py-2 text-base w-24 h-10" onClick={() => setActiveSection("teamActive")}>Team</button>
                </div>
                <div className="gap-4 mb-4">
                    {activeSection === "tasksActive" && (
                        <div className="gap-4 mb-4">
                            <table class="w-full table-fixed text-left">
                                <thead class="bg-gray-100">
                                    <tr className="h-12">
                                        <th class="px-4 py-2 w-1/5 text-sm text-black">Name</th>
                                        <th class="px-4 py-2 w-1/5 text-sm text-black">Assigned To</th>
                                        <th class="px-4 py-2 w-1/5 text-sm text-black">Assignee</th>
                                        <th class="px-4 py-2 w-1/5 text-sm text-black">Date Assigned</th>
                                        <th class="px-4 py-2 w-1/5 text-sm text-black">Priority</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100">
                                    <tr class="border-t border-gray-200 h-12"></tr>
                                    <tr class="border-t border-gray-200 h-12"></tr>
                                    <tr class="border-t border-gray-200 h-12"></tr>
                                    <tr class="border-t border-gray-200 h-12"></tr>
                                    <tr class="border-t border-gray-200 h-12"></tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeSection === "teamActive" && (
                        <div className="flex flex-row gap-4 mb-4 justify-start">
                            {team.map(teamMember => (
                                <div className ="w-40 h-32 bg-white rounded mb-4" key={teamMember.id}>
                                    <p className="text-black font-semibold mb-4">{teamMember.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default KanbanBoard;