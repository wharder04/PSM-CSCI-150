import { useState } from "react";
import { useEffect } from "react";
import user from "../../data/currentUser.json";
import projectData from "../../data/projects.json";
import taskData from "../../data/tasks.json";
import "../../css/DashboardPage.css";
import DashboardLayout from "./DashboardLayout";

function Dashboard() {
  const [name, setName] = useState("");
  const [tasks, setTasks] = useState("");
  const [projects, setProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);

  useEffect(() => {
    setName(`${user.name}`);
    setProjects(projectData[2]);
  }, [])

  return (
    <div className="flex w-full min-h-screen p-8 bg-gray-100 text-black">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-black font-sans mb-6">
          My Dashboard
        </h2>
        <div className="bg-gray-300 rounded-xl p-10 shadow-inner">
          <p className="text-2xl text-black font-sans font-semibold">
            Good Morning {name}
          </p>
        </div>
      </div>
      <div className="flex gap-10">
        <div className="flex-1">
          <h2 className="text-xl text-black font-sans font-bold">
            Your Projects
          </h2>
          <p className="text-gray-500 font-sans">
            Here's an overview of your group projects
          </p>
        </div>
        <div className="flex-1">
          <button className="bg-gray-300 text-black font-sans rounded w-32 h-10">
            Create New
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
