import { useState, useEffect } from "react";
import projectData from "../../data/projects.json";
import { useAuth } from "../../AuthContext";
import { MdTrendingUp, MdFolder, MdCheckCircle, MdCalendarToday, MdAdd } from "react-icons/md";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    setProjects(Array.isArray(projectData) ? projectData : []);
  }, []);

  const totalProjects = projects.length;
  const totalTasks = projects.reduce((sum, project) => sum + (project.totalTasks || 0), 0);
  const totalTasksCompleted = projects.reduce((sum, project) => sum + (project.completedTasks || 0), 0);
  const activeProjects = projects.filter(p => p.status === "In Progress").length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    let date;
    if (dateString.includes("/")) {
      const [month, day, year] = dateString.split("/");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      date = new Date(dateString);
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen w-full p-2 bg-bg-base">
      <div className="mb-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
          {getGreeting()}, {user?.name || 'User'}!
        </h1>
        <p className="text-base text-text-secondary">Here's what's happening with your projects today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-7xl">
        <div className="bg-panel rounded-2xl p-6 flex items-center gap-5 shadow-soft border border-border hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-2xl bg-accent-dark flex items-center justify-center text-white flex-shrink-0">
            <MdFolder size={28} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary font-medium mb-2 uppercase tracking-wide">Total Projects</p>
            <p className="text-3xl font-bold text-text-primary mb-1 leading-tight">{totalProjects}</p>
            <p className="text-xs text-text-secondary font-medium">{activeProjects} Active</p>
          </div>
        </div>

        <div className="bg-panel rounded-2xl p-6 flex items-center gap-5 shadow-soft border border-border hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-2xl bg-accent-mid flex items-center justify-center text-white flex-shrink-0">
            <MdCheckCircle size={28} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary font-medium mb-2 uppercase tracking-wide">Tasks Completed</p>
            <p className="text-3xl font-bold text-text-primary mb-1 leading-tight">{totalTasksCompleted}</p>
            <p className="text-xs text-text-secondary font-medium">of {totalTasks} total</p>
          </div>
        </div>

        <div className="bg-panel rounded-2xl p-6 flex items-center gap-5 shadow-soft border border-border hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-2xl bg-accent-mid flex items-center justify-center text-white flex-shrink-0">
            <MdTrendingUp size={28} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary font-medium mb-2 uppercase tracking-wide">Active Projects</p>
            <p className="text-3xl font-bold text-text-primary mb-1 leading-tight">{activeProjects}</p>
            <p className="text-xs text-text-secondary font-medium">In Progress</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">Recent Projects</h2>
            <p className="text-sm text-text-secondary">Overview of your active projects</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-accent-dark text-white rounded-xl text-sm font-semibold shadow-medium hover:-translate-y-0.5 hover:shadow-large transition-all duration-200">
            <MdAdd size={20} />
            <span>New Project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-panel rounded-2xl p-6 shadow-soft border border-border hover:-translate-y-1 hover:shadow-large hover:border-accent-light transition-all duration-300 flex flex-col gap-5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-1">{project.name}</h3>
                  <p className="text-sm text-text-secondary">{project.className}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide flex-shrink-0 ${project.status === "In Progress"
                  ? "bg-panel-muted text-accent-mid"
                  : "bg-panel-muted text-accent-dark"
                  }`}>
                  {project.status}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary font-medium">Progress</span>
                  <span className="text-sm text-text-primary font-bold">{project.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-panel-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-dark transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-panel-muted">
                <div className="flex items-center gap-2 text-text-secondary text-xs">
                  <MdCalendarToday size={16} className="text-text-muted" />
                  <span>Due: {formatDate(project.dueDate)}</span>
                </div>
                {project.remainingTasks !== undefined && (
                  <div className="text-xs text-text-secondary font-medium">
                    {project.remainingTasks} tasks remaining
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
