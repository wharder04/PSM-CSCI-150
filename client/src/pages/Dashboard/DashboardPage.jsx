import { useState } from "react";
import { useEffect } from "react";
import user from "../../data/currentUser.json";
import projectData from "../../data/projects.json";
import "../../css/DashboardPage.css";
import DashboardLayout from "./DashboardLayout";

function Dashboard() {
  const [name, setName] = useState("");
  const [projects, setProjects] = useState([]);
  const totalProjects = projects.length;
  const totalTasks = projects.totalTasks;
  const totalTasksCompleted = projects.completedTasks;

  useEffect(() => {
    setName(`${user.name}`);
    setProjects(projectData[2]);
  }, [])

  return (
    <div className="flex w-full min-h-screen p-8 bg-gray-100 text-black">
      <div className="w-5/6 h-1/2 mb-10">
        <h2 className="text-3xl font-bold text-black font-sans mb-6">
          My Dashboard
        </h2>
        <div className="bg-gray-300 rounded-xl p-10 shadow-inner">
          <p className="text-2xl text-black font-sans font-semibold">
            Good Morning {name}
          </p>
        </div>
      </div>
      <div className="w-full h-full flex gap-10">
        <div className="flex flex-col w-full h-1/4">
          <h2 className="text-base text-black font-sans font-bold">
            Your Projects
          </h2>
          <p className="text-gray-500 text-sm font-sans">
            Here's an overview of your group projects
          </p>
        </div>
        <div className="flex flex-row w-full-h-full">
          <div className="flex flex-col w-3/5 h-full gap-4 mb-4">
            {projects.map(project => (
              <div className="w-full h-full border-2 border-black bg-white rounded" key={project.id}>
                <p className="text-black text-base p-2">{project.name}</p>
                <p className="text-black text-sm pb-4">{project.className}</p>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-black">Progress Tracker</p>
                  <p className="text-sm text-black">{project.progress}%</p>
                </div>
                <div className="w-full bg-gray-300 h-4 rounded">
                  <div className="bg-black h-4 rounded transition-all duration-300" style={{width: `${project.progress}%`}}></div>
                </div>
                <p className="text-black text-sm p-4">Due: {project.dueDate}</p>
              </div>
            ))}
          </div>
          <div className="relative w-2/5 h-full bg-gray-100 p-4">
            <div className="w-2/5 h-1/2 bg-gray-300 rounded mb-3 flex flex-col">
              <p className="text-black font-semibold text-2x1">Total Projects</p>
              <p className="text-black font-semibold text-2x1">{totalProjects}</p>
            </div>
            <div className="flex justify-between">
              <div className="w-1/5 h-1/3 bg-gray-300 rounded mr-2 flex flex-col">
                <p className="text-black font-semibold text-2x1">Total Tasks</p>
                <p className="text-black font-semibold text-2x1">{totalTasks}</p>
              </div>
              <div className="w-1/5 h-1/3 bg-gray-300 rounded flex flex-col">
                <p className="text-black font-semibold text-2x1">Task Completed</p>
                <p className="text-black font-semibold text-2x1">{totalTasksCompleted}</p>
              </div>
            </div>
            <button className="absolute bottom-0 right-0 bg-gray-300 text-black font-sans rounded w-14 h-10">
              Create New
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
