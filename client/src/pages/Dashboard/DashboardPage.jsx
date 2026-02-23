import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { projectService, profileService } from "../../../services/api";
import {
  MdTrendingUp,
  MdFolder,
  MdCheckCircle,
  MdCalendarToday,
  MdAdd,
} from "react-icons/md";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await projectService.getDashboardData();
        if (response && response.success) {
          setDashboardData(response.data);
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalProjects = dashboardData?.projects?.total || 0;
  const totalTasks = dashboardData?.taskStats?.totalTasks || 0;
  const totalTasksCompleted = dashboardData?.taskStats?.completedTasks || 0;
  const activeProjects = projects.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-200";
      case "Busy":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "In a Meeting":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Offline":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === user?.status) return;

    setStatusLoading(true);
    try {
      const response = await profileService.updateProfile({
        status: newStatus,
      });
      if (response && response.ok) {
        // Update AuthContext with new user data
        const updatedUser = {
          ...user,
          status: newStatus,
        };
        login(updatedUser);
      } else {
        console.error("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  useEffect(() => {
    const fetchProjectProgress = async () => {
      if (!dashboardData) return;

      const allProjects = [
        ...(dashboardData.projects.owner || []),
        ...(dashboardData.projects.memberOf || []),
      ];

      if (allProjects.length === 0) {
        setProjects([]);
        return;
      }

      const progressPromises = allProjects.map(async (project) => {
        try {
          const progressResponse = await projectService.getProgress(
            project._id
          );
          if (progressResponse && progressResponse.success) {
            return {
              ...project,
              progress: progressResponse.data.percent || 0,
              totalTasks: progressResponse.data.total || 0,
              completedTasks: progressResponse.data.completed || 0,
            };
          }
          return { ...project, progress: 0, totalTasks: 0, completedTasks: 0 };
        } catch (err) {
          console.error(
            `Error fetching progress for project ${project._id}:`,
            err
          );
          return { ...project, progress: 0, totalTasks: 0, completedTasks: 0 };
        }
      });

      const projectsWithProgress = await Promise.all(progressPromises);
      setProjects(projectsWithProgress);
    };

    fetchProjectProgress();
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen w-full p-2 bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mb-4"></div>
          <p className="text-sm text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full p-2 bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Error loading dashboard
          </h3>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-2 bg-bg-main">
      <div className="mb-8 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
              {getGreeting()}, {user?.name || "User"}!
            </h1>
            <p className="text-base text-text-secondary">
              Here's what's happening with your projects today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label
              htmlFor="status-select"
              className="text-sm font-medium text-text-secondary"
            >
              Status:
            </label>
            <select
              id="status-select"
              value={user?.status || "Active"}
              onChange={handleStatusChange}
              disabled={statusLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(
                user?.status || "Active"
              )}`}
            >
              <option value="Active">Active</option>
              <option value="Busy">Busy</option>
              <option value="In a Meeting">In a Meeting</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-7xl">
        <div className="bg-bg-surface rounded-2xl p-6 flex items-center gap-5 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MdFolder size={28} className="text-icon-default" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary font-medium mb-2 uppercase tracking-wide">
              Total Projects
            </p>
            <p className="text-3xl font-bold text-text-primary mb-1 leading-tight">
              {totalProjects}
            </p>
            <p className="text-xs text-text-secondary font-medium">
              {activeProjects} Active
            </p>
          </div>
        </div>

        <div className="bg-bg-surface rounded-2xl p-6 flex items-center gap-5 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MdCheckCircle size={28} className="text-icon-default" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary font-medium mb-2 uppercase tracking-wide">
              Tasks Completed
            </p>
            <p className="text-3xl font-bold text-text-primary mb-1 leading-tight">
              {totalTasksCompleted}
            </p>
            <p className="text-xs text-text-secondary font-medium">
              of {totalTasks} total
            </p>
          </div>
        </div>

        <div className="bg-bg-surface rounded-2xl p-6 flex items-center gap-5 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MdTrendingUp size={28} className="text-icon-default" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary font-medium mb-2 uppercase tracking-wide">
              Active Projects
            </p>
            <p className="text-3xl font-bold text-text-primary mb-1 leading-tight">
              {activeProjects}
            </p>
            <p className="text-xs text-text-secondary font-medium">
              In Progress
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              Recent Projects
            </h2>
            <p className="text-sm text-text-secondary">
              Overview of your active projects
            </p>
          </div>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 px-6 py-3 bg-accent-primary text-text-on-accent rounded-xl text-sm font-semibold shadow-medium hover:-translate-y-0.5 hover:shadow-large transition-all duration-200 cursor-pointer"
          >
            <MdAdd size={20} />
            <span>New Project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((project) => {
              const remainingTasks =
                (project.totalTasks || 0) - (project.completedTasks || 0);
              return (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default hover:-translate-y-1 hover:shadow-large transition-all duration-300 flex flex-col justify-between gap-2 cursor-pointer hover:bg-bg-surface-hover hover:border-border-hover"
                >
                  <div className="flex justify-between items-start gap-4 mb-8">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text-primary mb-1 hover:text-accent-highlight">
                        {project.name}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {project.desc || "No description"}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide flex-shrink-0 bg-bg-surface-hover text-text-secondary">
                      Active
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-secondary font-medium">
                        Progress
                      </span>
                      <span className="text-sm text-text-primary font-bold">
                        {project.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-border-track overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-highlight transition-all duration-300"
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-border-default">
                    {project.dueDate && (
                      <div className="flex items-center gap-2 text-text-secondary text-xs">
                        <MdCalendarToday
                          size={16}
                          className="text-text-muted"
                        />
                        <span>Due: {formatDate(project.dueDate)}</span>
                      </div>
                    )}
                    {remainingTasks > 0 && (
                      <div className="text-xs text-text-secondary font-medium">
                        {remainingTasks} tasks remaining
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-text-secondary">
                No projects found. Create your first project to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
