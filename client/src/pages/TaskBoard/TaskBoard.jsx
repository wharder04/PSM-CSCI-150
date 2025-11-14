import DashboardLayout from "./DashboardLayout";

function TaskBoard () {
    return(
        <DashboardLayout>
            <div>
                <div>
                    <h2>Task Board</h2>
                    <p>Drag tasks to update their status</p>
                </div>
                <div>
                    <div>
                        <p>Unassigned</p>
                    </div>
                    <div>
                        <p>Assigned</p>
                    </div>
                    <div>
                        <p>In Progress</p>
                    </div>
                    <div>
                        <p>Completed</p>
                    </div>
                    <div>
                        <p>Incomplete</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default TaskBoard;