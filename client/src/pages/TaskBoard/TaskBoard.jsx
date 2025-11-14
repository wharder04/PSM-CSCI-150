import DashboardLayout from "./DashboardLayout";

function TaskBoard () {
    return(
        <DashboardLayout>
            <div>
                <div>
                    <h2 className="text-3xl font-bold text-black mb-6">Task Board</h2>
                    <p className="text-2xl text-black font-semibold">Drag tasks to update their status</p>
                    <button className="bg-gray-800 text-white font-sans rounded w-32 h-10">Filters</button>
                    <button className="bg-gray-300 text-black font-sans rounded w-32 h-10">Create New Task</button>
                </div>
                <div className="flex flex-row">
                    <div className="w-32 h-96 rounded">
                        <p className="text-black font-sans">Unassigned</p>
                    </div>
                    <div className="w-32 h-96 rounded">
                        <p className="text-black font-sans">Assigned</p>
                    </div>
                    <div className="w-32 h-96 rounded">
                        <p className="text-black font-sans">In Progress</p>
                    </div>
                    <div className="w-32 h-96 rounded">
                        <p className="text-black font-sans">Completed</p>
                    </div>
                    <div className="w-32 h-96 rounded">
                        <p className="text-black font-sans">Incomplete</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default TaskBoard;