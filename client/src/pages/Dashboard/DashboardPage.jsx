import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { projectService, profileService } from "../../../services/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  MdTrendingUp,
  MdFolder,
  MdCheckCircle,
  MdCalendarToday,
  MdAdd,
  MdNotificationsNone,
  MdFormatListBulleted,
  MdGroup,
} from "react-icons/md";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [selectedProjectName, setSelectedProjectName] = useState("Select a project");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const fetchDashboardData = async (projId, showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const response = await projectService.getDashboardData(projId);
      if (response && response.success) {
        setDashboardData(response.data);
      } else {
        if (showLoading) setError("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      if (showLoading) setError("Failed to load dashboard data. Please try again.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedProjectId, true);

    const interval = setInterval(() => {
      fetchDashboardData(selectedProjectId, false);
    }, 10000); // 10 seconds realtime polling

    return () => clearInterval(interval);
  }, [selectedProjectId]);

  const totalProjects = dashboardData?.projects?.total || 0;
  const totalTasks = dashboardData?.taskStats?.totalTasks || 0;
  const totalTasksCompleted = dashboardData?.taskStats?.completedTasks || 0;
  const activeProjects = projects.length;
  const remainingTasks = totalTasks - totalTasksCompleted;
  const completionRate = dashboardData?.taskStats?.completionRate || 0;

  const activeProjectObj = projects.find((p) => p._id === selectedProjectId);

  const getExpectedProgress = (project) => {
    if (!project || !project.dueDate) return 0;
    const start = new Date(project.startDate || project.createdAt).getTime();
    const end = new Date(project.dueDate).getTime();
    const now = new Date().getTime();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
  };

  const comparisonData = selectedProjectId 
    ? (activeProjectObj ? [
        {
          name: 'Project',
          expected: getExpectedProgress(activeProjectObj),
          actual: activeProjectObj.progress || 0
        }
      ] : [])
    : projects.slice(0, 2).map((p) => ({
        name: p.name,
        expected: getExpectedProgress(p),
        actual: p.progress || 0
      }));

  const comparisonLegendPayload = [
    { value: 'Expected Progress', type: 'square', id: 'expected', color: '#94a3b8' },
    { value: 'Actual Progress', type: 'square', id: 'actual', color: '#3b82f6' },
    { value: 'Behind Schedule', type: 'square', id: 'behind', color: '#f87171' },
  ];

  const renderComparisonTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const expected = payload.find(p => p.dataKey === 'expected')?.value || 0;
      const actual = payload.find(p => p.dataKey === 'actual')?.value || 0;
      const isBehind = expected - actual > 10;
      return (
        <div className="bg-[#25252b] border border-border-default p-3 rounded-lg shadow-lg z-50">
          <p className="text-white text-sm font-semibold mb-2">{label}</p>
          <p className="text-[#94a3b8] text-xs mb-1">Expected Progress : {expected}</p>
          <p className="text-[#3b82f6] text-xs">Actual Progress : {actual}</p>
          {isBehind && <p className="text-[#f87171] text-xs mt-2 font-bold">Behind Schedule : {expected - actual}</p>}
        </div>
      );
    }
    return null;
  };

  const completedTasks = dashboardData?.taskStats?.completedTasks || 0;
  const inProgressTasks = dashboardData?.taskStats?.inProgressTasks || 0;
  const toDoTasks = (dashboardData?.taskStats?.assignedTasks || 0) + (dashboardData?.taskStats?.testingTasks || 0);
  const totalChartTasks = completedTasks + inProgressTasks + toDoTasks;
  
  const chartData = [
    { name: 'Completed', value: completedTasks, color: '#10b981' }, 
    { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' }, 
    { name: 'To Do', value: toDoTasks, color: '#f59e0b' } 
  ].filter(item => item.value > 0);
  
  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = totalChartTasks > 0 ? Math.round((data.value / totalChartTasks) * 100) : 0;
      return (
        <div className="bg-[#25252b] border border-border-default p-3 rounded-lg shadow-lg">
          <p className="text-white text-sm font-semibold">{`${data.name}: ${data.value} Task${data.value !== 1 ? 's' : ''}`}</p>
          <p className="text-[#e0e0e0] text-xs mt-1">{`${percent}% of total`}</p>
        </div>
      );
    }
    return null;
  };

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
          {activeProjectObj ? (
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
                {activeProjectObj.name}
              </h1>
              <p className="text-base text-text-secondary max-w-2xl">
                {activeProjectObj.desc || "No description provided."}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1.5 bg-bg-surface px-3 py-1.5 rounded-lg border border-border-default shadow-sm">
                  <MdGroup size={16} className="text-text-muted" />
                  <span className="font-semibold text-text-primary">{activeProjectObj.memberCount || 1}</span> members
                </div>
                {activeProjectObj.dueDate && (
                  <div className="flex items-center gap-1.5 bg-bg-surface px-3 py-1.5 rounded-lg border border-border-default shadow-sm">
                    <MdCalendarToday size={16} className="text-text-muted" />
                    <span>Due:</span> <span className="font-semibold text-text-primary">{formatDate(activeProjectObj.dueDate)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-bg-surface px-3 py-1.5 rounded-lg border border-border-default shadow-sm">
                  <span className="font-semibold text-accent-highlight">{activeProjectObj.progress || 0}%</span>
                  <span>Progress</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
                {getGreeting()}, {user?.name || "User"}!
              </h1>
              <p className="text-base text-text-secondary">
                Here's what's happening with your projects today
              </p>
            </div>
          )}
          <div className="flex items-center gap-4">
            {/* Project Selection Dropdown */}
            <div className="relative hidden md:flex items-center">
              <div 
                className="flex items-center bg-bg-surface border border-border-default rounded-lg px-3 py-2 cursor-pointer hover:border-border-hover transition-colors w-48"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              >
                <MdFolder className="text-text-secondary mr-2 flex-shrink-0" size={18} />
                <span className="text-sm font-medium text-text-primary truncate flex-1">
                  {selectedProjectName}
                </span>
                <div className="text-text-secondary text-xs ml-2 pointer-events-none">
                  ▼
                </div>
              </div>

              {isProjectDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProjectDropdownOpen(false)}
                  ></div>
                  <div className="absolute top-full left-0 mt-2 w-full bg-[#1e1e26] border border-border-default shadow-lg rounded-lg z-50 overflow-hidden py-1">
                    <ul className="max-h-60 overflow-y-auto">
                      <li 
                        className="px-4 py-2 text-sm text-[#e0e0e0] hover:bg-accent-primary hover:text-white cursor-pointer transition-colors"
                        onClick={() => { setSelectedProjectName("Select a project"); setSelectedProjectId(""); setIsProjectDropdownOpen(false); }}
                      >
                        Select a project
                      </li>
                      {projects.map((p) => (
                        <li 
                          key={p._id} 
                          className="px-4 py-2 text-sm text-[#e0e0e0] hover:bg-accent-primary hover:text-white cursor-pointer transition-colors truncate"
                          onClick={() => { setSelectedProjectName(p.name); setSelectedProjectId(p._id); setIsProjectDropdownOpen(false); }}
                        >
                          {p.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative p-2.5 bg-bg-surface border border-border-default rounded-lg cursor-pointer hover:border-border-hover transition-colors flex items-center justify-center">
              <MdNotificationsNone className="text-text-primary" size={20} />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-bg-main shadow-sm">
                3
              </div>
            </div>

            <div className="h-8 w-px bg-border-default mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="status-select"
                className="text-sm font-medium text-text-secondary hidden sm:block"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 max-w-7xl">
        {activeProjectObj ? (
          <>
            {/* Project Progress Card */}
            <div className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Project Progress</h3>
                <MdTrendingUp size={20} className="text-accent-highlight" />
              </div>
              <div>
                <p className="text-3xl font-bold text-accent-highlight mb-1">{completionRate}%</p>
                <p className="text-xs text-text-secondary mb-3">Overall completion</p>
              </div>
            </div>

            {/* Pending Tasks Card */}
            <div className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Pending Tasks</h3>
                <MdFormatListBulleted size={20} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary mb-1">{(dashboardData?.taskStats?.assignedTasks || 0) + (dashboardData?.taskStats?.testingTasks || 0)}</p>
                <p className="text-xs text-text-secondary mb-3">Tasks in progress</p>
              </div>
            </div>

            {/* Completed Tasks Card */}
            <div className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Tasks Completed</h3>
                <MdCheckCircle size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary mb-1">{dashboardData?.taskStats?.completedTasks || 0}</p>
                <p className="text-xs text-text-secondary mb-3">Total resolved tasks</p>
              </div>
            </div>

            {/* Team Size Card */}
            <div className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Team Size</h3>
                <MdGroup size={20} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary mb-1">{activeProjectObj.memberCount || 1}</p>
                <p className="text-xs text-text-secondary mb-3">Active members</p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Active Projects Card */}
            <div className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Active Projects</h3>
                <MdFolder size={20} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary mb-1">{activeProjects}</p>
                <p className="text-xs text-text-secondary mb-3">Currently enrolled</p>
                <p className="text-xs text-green-500 font-medium">↑ 12% from last week</p>
              </div>
            </div>

            {/* Assigned Tasks Card */}
            <div className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Assigned Tasks</h3>
                <MdFormatListBulleted size={20} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary mb-1">{remainingTasks}</p>
                <p className="text-xs text-text-secondary mb-3">Tasks to complete</p>
                <p className="text-xs text-red-500 font-medium">↓ 5% from last week</p>
              </div>
            </div>

            {/* Completed Tasks Card */}
            <div className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Completed Tasks</h3>
                <MdCheckCircle size={20} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary mb-1">{totalTasksCompleted}</p>
                <p className="text-xs text-text-secondary mb-3">This semester</p>
                <p className="text-xs text-green-500 font-medium">↑ 18% from last week</p>
              </div>
            </div>

            {/* Overall Progress Card */}
            <div className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Overall Progress</h3>
                <MdTrendingUp size={20} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-text-primary mb-1">{completionRate}%</p>
                <p className="text-xs text-text-secondary mb-3">Average completion rate</p>
                <p className="text-xs text-green-500 font-medium">↑ 8% from last week</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="max-w-7xl mb-10">
        <div className="bg-[#1e1e26] rounded-2xl p-6 shadow-soft border border-border-default">
          <h2 className="text-xl font-bold text-white mb-6">
            Task Status Distribution
            {selectedProjectId && <span className="text-sm font-normal text-[#e0e0e0] ml-2">({selectedProjectName})</span>}
          </h2>
          
          <div className="h-72 w-full flex items-center justify-center">
            {totalChartTasks > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ x, y, cx, name, percent }) => (
                      <text 
                        x={x} 
                        y={y} 
                        fill="#ffffff" 
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central" 
                        fontSize="12" 
                        fontWeight="500"
                      >
                        {`${name}: ${(percent * 100).toFixed(0)}%`}
                      </text>
                    )}
                    labelLine={false}
                    className="text-xs"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#1e1e26" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={renderCustomTooltip} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="square"
                    formatter={(value) => <span className="text-[#e0e0e0] text-sm ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[#e0e0e0] flex flex-col items-center">
                <MdFormatListBulleted size={48} className="text-text-muted mb-2 opacity-20" />
                <p>No tasks available to visualize.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default max-w-7xl mb-10">
        <h2 className="text-xl font-bold text-text-primary mb-6">Progress Comparison</h2>
        <div className="h-80 w-full relative">
          {comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{fill: '#e0e0e0', fontSize: 12}} 
                  axisLine={{ stroke: '#2a2a35' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{fill: '#e0e0e0', fontSize: 12}} 
                  domain={[0, 100]} 
                  label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft', fill: '#e0e0e0', fontSize: 12, style: { textAnchor: 'middle' } }} 
                  axisLine={{ stroke: '#2a2a35' }}
                  tickLine={false}
                />
                <Tooltip content={renderComparisonTooltip} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                <Legend 
                  payload={comparisonLegendPayload}
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="square"
                  formatter={(value) => <span className="text-[#e0e0e0] text-sm ml-1">{value}</span>}
                />
                <Bar dataKey="expected" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="actual" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(entry.expected - entry.actual) > 10 ? '#f87171' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-text-secondary">
              <p>Not enough temporal data to generate comparison.</p>
            </div>
          )}
        </div>
      </div>

      {!selectedProjectId && (
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

        <div className="flex flex-col gap-4">
          {projects.length > 0 ? (
            projects.map((project) => {
              const remainingTasks =
                (project.totalTasks || 0) - (project.completedTasks || 0);
              return (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="bg-bg-surface rounded-2xl p-5 shadow-soft border border-border-default hover:-translate-y-1 hover:shadow-large transition-all duration-300 flex flex-col gap-4 cursor-pointer hover:bg-bg-surface-hover hover:border-border-hover w-full relative"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Title & Badge */}
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-text-primary hover:text-accent-highlight truncate">
                        {project.name}
                      </h3>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-bg-surface-hover text-text-secondary border border-border-default">
                        Active
                      </span>
                    </div>

                    {/* Meta Data on Right */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#e0e0e0] lg:justify-end">
                      <div className="flex items-center gap-1.5 opacity-80">
                        <MdGroup size={16} className="text-text-muted" />
                        <span>{project.memberCount || 1} members</span>
                      </div>
                      
                      {project.dueDate && (
                        <div className="flex items-center gap-1.5 opacity-80">
                          <MdCalendarToday size={16} className="text-text-muted" />
                          <span>Due {formatDate(project.dueDate)}</span>
                        </div>
                      )}
                      
                      {remainingTasks > 0 && (
                        <div className="flex items-center gap-1.5 whitespace-nowrap opacity-80">
                          <span>{remainingTasks} tasks remaining</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col w-full gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Progress</span>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 rounded-full bg-border-track overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-highlight transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-[#ffffff] min-w-[36px] text-right">
                        {project.progress || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full text-center py-12 bg-bg-surface rounded-2xl border border-border-default border-dashed">
              <p className="text-text-secondary">
                No projects found. Create your first project to get started.
              </p>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
