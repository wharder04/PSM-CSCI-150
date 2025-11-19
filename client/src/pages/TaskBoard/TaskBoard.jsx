import { useState } from "react";
import { MdAdd } from "react-icons/md";
import DashboardLayout from "./DashboardLayout";

function TaskBoard () {
    const [unAssignedTasks, setUnassignedTasks] = useState([])
    const [assignedTasks, setAssignedTasks] = useState([])
    const [inProgressTasks, setInProgressTasks] = useState([])
    const [completedTasks, setCompletedTasks] = useState([])
    const [incompleteTasks, setIncompleteTasks] = useState([])

    return(
        <DashboardLayout>
            <div className="min-h-screen p-8 bg-gray-100 text-black">
                <div>
                    <h2 className="text-3xl font-bold text-black mb-6">Task Board</h2>
                    <p className="text-2xl text-black font-semibold">Drag tasks to update their status</p>
                    <button className="bg-gray-800 text-white font-sans rounded w-32 h-10">Filters</button>
                    <button className="bg-gray-300 text-black font-sans rounded w-32 h-10">Create New Task</button>
                </div>
                <div className="flex flex-row">
                    <div className="flex flex-column border-2 border-black w-32 h-96 rounded">
                        <div className="text-black font-sans">
                            <p>Unassigned</p>
                            <MdAdd size={30} color="black"/>
                        </div>
                        <div class="w-full border-t border-black"></div>
                    </div>
                    <div className="flex flex-column border-2 border-black w-32 h-96 rounded">
                        <div className="text-black font-sans">
                            <p>Assigned</p>
                            <MdAdd size={30} color="black"/>
                        </div>
                        <div class="w-full border-t border-black"></div>
                    </div>
                    <div className="flex flex-column border-2 border-black w-32 h-96 rounded">
                        <div className="text-black font-sans">
                            <p>In Progress</p>
                            <MdAdd size={30} color="black"/>
                        </div>
                        <div class="w-full border-t border-black"></div>
                    </div>
                    <div className="flex flex-column border-2 border-black w-32 h-96 rounded">
                        <div className="text-black font-sans">
                            <p>Completed</p>
                            <MdAdd size={30} color="black"/>
                        </div>
                        <div class="w-full border-t border-black"></div>
                    </div>
                    <div className="flex flex-column border-2 border-black w-32 h-96 rounded">
                        <div className="text-black font-sans">
                            <p>Incomplete</p>
                            <MdAdd size={30} color="black"/>
                        </div>
                        <div class="w-full border-t border-black"></div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default TaskBoard;