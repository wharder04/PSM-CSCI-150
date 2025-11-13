import { useState } from "react";
import "../../css/DashboardPage.css";
import DashboardLayout from "./DashboardLayout";

function Dashboard() {
  const [name, setName] = useState("");
  const [projects, setProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-6">My Dashboard</h2>
          <div className="bg-gray-300 rounded-xl p-10 shadow-inner">
            <p className="text-2xl font-semibold">Good Morning</p>
          </div>
        </div>
        <div className="flex gap-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold">Your Projects</h2>
            <p className="text-gray-500">Here's an overview of your group projects</p>
          </div>
          <div className="flex-1"></div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
