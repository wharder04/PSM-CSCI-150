import DashboardLayout from "./DashboardLayout";

function TaskBoard () {
    return(
        <DashboardLayout>
            <div>
                <div>
                    <h2 className="text-3xl font-bold text-black mb-6">Task Board</h2>
                    <p className="text-2xl text-black font-semibold">Drag tasks to update their status</p>
                </div>
                <div>
                    <div>
                        <p className="text-black font-sans">Unassigned</p>
                    </div>
                    <div>
                        <p className="text-black font-sans">Assigned</p>
                    </div>
                    <div>
                        <p className="text-black font-sans">In Progress</p>
                    </div>
                    <div>
                        <p className="text-black font-sans">Completed</p>
                    </div>
                    <div>
                        <p className="text-black font-sans">Incomplete</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default TaskBoard;