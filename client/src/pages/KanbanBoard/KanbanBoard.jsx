import { useState } from "react";

function KanbanBoard () {
    const [projDescription, setProjDescription] = useState("");
    const [totalTasks, setTotalTasks] = useState(0);
    const [assignedTasks, setAssignedTasks] = useState(0);
    const [incompleteTasks, setIncompleteTasks] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [overdueTasks, setOverdueTasks] = useState(0);
    const [tasks, setTasks] = useState([]);
    const [team, setTeam] = useState([]);
    const [activeSection, setActiveSection] = useState("tasksActive");
    
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
                        <div className="gap-4 mb-4">
                            <p className="text-black text-base">Team members go here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default KanbanBoard;