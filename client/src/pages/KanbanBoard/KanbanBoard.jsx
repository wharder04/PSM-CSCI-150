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
    const [showPopup, setShowPopup] = useState(false);
    const [memberEmail, setMemberEmail] = useState("");
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
    const [assigneeDropdown, setAssigneeDropdown] = useState(false);


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
                    <button className="bg-gray-800 text-white font-sans rounded w-24 h-10 mb-4" onClick={() => setShowPopup(true)}>+ New Task</button>
                    {showPopup && (
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPopup(false)}></div>
                    )}
                    {showPopup && (
                        <div className="fixed right-0 top-0 w-96 h-full bg-white p-6 z-50">
                            <div className="flex flex-col">
                                <div className=" relative flex flex-row">
                                    <h2 className="text-black text-base font-semibold">Add New Task</h2>
                                    <p className="absolute right-0 text-black text-sm">x</p>
                                </div>
                                <div className="flex flex-row">
                                    <p className="text-base text-black mb-4">Name</p>
                                    <input 
                                        type="text"
                                        value={newTaskName}
                                        onChange={(e) =>  setNewTaskName(e.target.value)}
                                        className="border-b-2 border-black focus:outline-none focus:border-black w-full py-1"
                                    />
                                </div>
                                <div className="flex flex-row">
                                    <p className="text-base text-black mb-4">Description</p>
                                    <input 
                                        type="text"
                                        value={newTaskDescription}
                                        onChange={(e) =>  setNewTaskDescription(e.target.value)}
                                        className="border-b-2 border-black focus:outline-none focus:border-black w-full py-1"
                                    />
                                </div>
                                <div className="flex flex-row">
                                    <p className="text-black text-base">Priority</p>
                                    <div className="relative inline-block">
                                            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}></button>
                                            {priorityDropdownOpen && (
                                                <div className="absolute right-0 mt-2 w-1/4 bg-gray-200 rounded">
                                                    <button className="block w-full text-left text-black text-base px-4 py-2 bg-gray-200 rounded">Low</button>
                                                    <button className="block w-full text-left text-black text-base px-4 py-2 bg-gray-200 rounded">Medium</button>
                                                    <button className="block w-full text-left text-black text-base px-4 py-2 bg-gray-200 rounded">High</button>
                                                </div>
                                            )}
                                    </div>
                                </div>
                                <div className="flex flex-row">
                                    <p className="text-black text-base">Assigned To</p>
                                    <div className="relative inline-block">
                                            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setAssigneeDropdown(!assigneeDropdown)}></button>
                                            {assigneeDropdown && (
                                                <div className="absolute right-0 mt-2 w-1/4 bg-gray-200 rounded">
                                                    {team.map(teamMember =>
                                                        <button 
                                                            className="block w-full text-left text-black text-base px-4 py-2 bg-gray-200 rounded"
                                                            key={teamMember.id}
                                                        >{teamMember.name}</button>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
                            <table className="w-full table-fixed text-left">
                                <thead className="bg-gray-100">
                                    <tr className="h-12">
                                        <th className="px-4 py-2 w-1/5 text-sm text-black">Name</th>
                                        <th className="px-4 py-2 w-1/5 text-sm text-black">Assigned To</th>
                                        <th className="px-4 py-2 w-1/5 text-sm text-black">Assignee</th>
                                        <th className="px-4 py-2 w-1/5 text-sm text-black">Date Assigned</th>
                                        <th className="px-4 py-2 w-1/5 text-sm text-black">Priority</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-100 text-sm text-black">
                                    {tasks.map((task) => (
                                        <tr className="border-t border-gray-200 h-12" key={task.id}>
                                            <td className="text-black text-sm px-4">{task.name}</td>
                                            <td className="text-black text-sm px-4">{task.assignedTo}</td>
                                            <td className="text-black text-sm px-4">{task.assigneeId}</td>
                                            <td className="text-black text-sm px-4">{task.dateAssigned}</td>
                                            <td className="text-black text-sm px-4">{task.priority}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeSection === "teamActive" && (
                        <form className="w-2/3 h-1/2 flex flex-col border-2 border-black bg-white">
                            <p className="text-base font-semibold text-black p-2">Add New Member</p>
                            <p className="text-sm text-black p-2">Invite team member using their email id</p>
                            <div className="flex flex-row mb-4">
                                <div className="w-[60%] flex flex-col mb-8 text-white">
                                    <label className="font-medium">Email Address:</label>
                                        <input
                                            type="text"
                                            id="email"
                                            name="email"
                                            value={memberEmail}
                                            onChange={(e) => setMemberEmail(e.target.value)}
                                            className="px-4 py-3 rounded-xl bg-gray-700"
                                        />
                                </div>
                                <div className="flex flex-col mb-4">
                                    <p className="text-black text-base px-4 py-2">Role</p>
                                    <div className="relative inline-block">
                                        <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}></button>
                                        {roleDropdownOpen && (
                                            <div className="absolute mt-2 w-1/4 bg-gray-200 rounded">
                                                <button className="block w-full text-left text-black text-base px-4 py-2">Admin</button>
                                                <button className="block w-full text-left text-black text-base px-4 py-2">Member</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button className="w-1/3 h-1/5 bg-gray-200 text-black text-base">+ Add Member</button>
                        </form>
                    )}
                    {activeSection === "teamActive" && (
                        <div className="bg-white w-xl h-64 flex flex-col mb-4">
                            <p className="bg-white text-base text-black mb-4">Team Members</p>
                            <div className="flex flex-col gap-4 mb-4">
                                {team.map(teamMember => (
                                    <div className ="w-xl h-24 bg-white rounded mb-4 flex flex-row items-center justify-between px-4" key={teamMember.id}>
                                        <p className="text-black font-semibold">{teamMember.name}</p>
                                        <div className="relative inline-block">
                                            <button className="px-4 py-2 bg-gray-200 rounded text-base text-black" onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}>Select Role</button>
                                            {memberDropdownOpen && (
                                                <div className="absolute right-0 mt-2 w-1/4 bg-gray-200 rounded">
                                                    <button className="block w-full text-left text-black text-base px-4 py-2">Admin</button>
                                                    <button className="block w-full text-left text-black text-base px-4 py-2">Member</button>
                                                </div>
                                             )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default KanbanBoard;