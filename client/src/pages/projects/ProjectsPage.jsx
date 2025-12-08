import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from "../../../services/api";
import { useAuth } from "../../AuthContext";
import {
  MdSearch,
  MdCalendarToday,
  MdAdd,
  MdFilterList,
  MdClose,
  MdEvent,
} from "react-icons/md";

function ProjectCard({
  id,
  _id,
  name,
  className,
  desc,
  dueDate,
  status,
  progress,
  remainingTasks,
  totalTasks,
  completedTasks,
}) {
  const navigate = useNavigate();

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

  const handleCardClick = () => {
    navigate(`/projects/${_id || id}`);
  };

  const projectProgress = progress || 0;
  const tasksRemaining =
    remainingTasks !== undefined
      ? remainingTasks
      : (totalTasks || 0) - (completedTasks || 0);

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200 hover:-translate-y-1 hover:shadow-large transition-all duration-300 flex flex-col justify-between gap-2 cursor-pointer  hover:bg-gray-100 hover:border-gray-300"
    >
      <div className="flex justify-between items-start gap-4 mb-8">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-text-primary mb-1 hover:text-blue-500">
            {name}
          </h3>
          <p className="text-sm text-text-secondary">
            {desc || className || "No description"}
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide flex-shrink-0 bg-gray-200 text-gray">
          Active
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-secondary font-medium">
            Progress
          </span>
          <span className="text-sm text-text-primary font-bold">
            {projectProgress}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${projectProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        {dueDate && (
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <MdCalendarToday size={16} className="text-text-muted" />
            <span>Due: {formatDate(dueDate)}</span>
          </div>
        )}
        {tasksRemaining > 0 && (
          <div className="text-xs text-text-secondary font-medium">
            {tasksRemaining} tasks remaining
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const userName = user?.name || "User";

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    dueDate: "",
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.myProjects();

      if (response && response.success) {
        // Combine owner and memberOf projects
        const allProjects = [
          ...(response.data.owner || []),
          ...(response.data.memberOf || []),
        ];

        if (allProjects.length === 0) {
          setProjects([]);
          setLoading(false);
          return;
        }

        // Fetch progress for each project (matching DashboardPage logic)
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
            return {
              ...project,
              progress: 0,
              totalTasks: 0,
              completedTasks: 0,
            };
          } catch (err) {
            console.error(
              `Error fetching progress for project ${project._id}:`,
              err
            );
            return {
              ...project,
              progress: 0,
              totalTasks: 0,
              completedTasks: 0,
            };
          }
        });

        const projectsWithProgress = await Promise.all(progressPromises);

        // Map to component format
        const mappedProjects = projectsWithProgress.map((project) => ({
          id: project._id,
          _id: project._id,
          name: project.name,
          className: project.desc || "No description",
          desc: project.desc,
          dueDate: project.dueDate,
          status: "Active",
          progress: project.progress || 0,
          totalTasks: project.totalTasks || 0,
          completedTasks: project.completedTasks || 0,
          remainingTasks:
            (project.totalTasks || 0) - (project.completedTasks || 0),
          incompleteTasks:
            (project.totalTasks || 0) - (project.completedTasks || 0),
          startDate: project.startDate,
          description: project.desc,
        }));

        setProjects(mappedProjects);
      } else {
        setError("Failed to fetch projects");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateError(null);

    // Validation
    if (!formData.name.trim()) {
      setCreateError("Project name is required");
      return;
    }

    setCreateLoading(true);
    try {
      // Format dates to ISO string if provided
      const payload = {
        name: formData.name.trim(),
        desc: formData.desc.trim() || undefined,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : undefined,
      };

      const response = await projectService.createProject(
        payload.name,
        payload.desc,
        undefined,
        payload.dueDate
      );

      if (response && response.success) {
        // Reset form
        setFormData({
          name: "",
          desc: "",
          dueDate: "",
        });
        setIsCreateModalOpen(false);
        setCreateError(null);

        // Refresh projects list
        fetchProjects();
      } else {
        setCreateError(response?.error || "Failed to create project");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      setCreateError(
        err.response?.data?.error ||
          err.message ||
          "Failed to create project. Please try again."
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      name: "",
      desc: "",
      dueDate: "",
    });
    setCreateError(null);
  };

  const filteredProjects = projects.filter((project) => {
    // Filter logic - all projects are "Active" now, so filter by completion status
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Active" && (project.progress || 0) < 100) ||
      (activeFilter === "Completed" && (project.progress || 0) === 100);

    const matchesSearch =
      !searchQuery ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.desc &&
        project.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.className &&
        project.className.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full p-2 bg-bg-base">
      <div className="mb-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
          Hello {userName}!
        </h1>
        <p className="text-base text-text-secondary">
          Manage and track all your projects in one place
        </p>
      </div>

      <div className="flex gap-5 mb-8 flex-wrap items-center max-w-7xl">
        <div className="relative flex-1 min-w-[300px] max-w-[500px]">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            size={20}
          />
          <input
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-panel border border-gray-200 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-mid focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-3 bg-panel px-2 py-2 rounded-xl border border-gray-200">
          <MdFilterList size={20} className="text-text-secondary ml-2" />
          <div className="flex gap-1">
            {["All", "Active", "Completed"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeFilter === filter
                    ? "bg-black text-white font-semibold"
                    : "text-text-secondary hover:bg-panel-muted hover:text-text-primary"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl">
        <h2 className="text-2xl font-bold text-text-primary mb-6 mr-2">
          My Projects{" "}
          <span className="text-sm font-medium">
            {loading ? "Loading..." : `(${filteredProjects.length})`}
          </span>
        </h2>

        {loading ? (
          <div className="text-center py-20 bg-panel rounded-2xl border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-dark mb-4"></div>
            <p className="text-sm text-text-secondary">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-panel rounded-2xl border border-gray-200">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Error loading projects
            </h3>
            <p className="text-sm text-text-secondary mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent-dark text-white rounded-lg text-sm font-medium hover:bg-accent-mid transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id || project.id}
                id={project.id}
                _id={project._id}
                name={project.name}
                className={project.className}
                desc={project.desc}
                dueDate={project.dueDate}
                status={project.status}
                progress={project.progress}
                remainingTasks={project.remainingTasks}
                totalTasks={project.totalTasks}
                completedTasks={project.completedTasks}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-panel rounded-2xl border border-gray-200">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No projects found
            </h3>
            <p className="text-sm text-text-secondary">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Get started by creating your first project"}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2.5 px-6 py-4 bg-black cursor-pointer text-white rounded-2xl text-sm font-semibold shadow-large hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 z-50"
      >
        <MdAdd size={24} />
        <span>Create New Project</span>
      </button>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 cursor-pointer"
          onClick={handleCloseModal}
        >
          <div
            className="bg-panel rounded-xl  shadow-large w-full max-w-xl h-full max-h-[90vh] overflow-y-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 rounded-tl-xl bg-panel px-6 py-5 flex justify-between items-center bg-white">
              <h2 className="text-xl font-semibold text-text-primary">
                Create New Project
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-text-muted hover:text-text-primary transition-colors p-1 cursor-pointer"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateProject}
              className="p-6 space-y-6 bg-white h-full overflow-y-none"
            >
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-5 items-center">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors"
                  placeholder="Enter project name"
                  disabled={createLoading}
                />
              </div>

              <div className="grid grid-cols-5 items-center">
                <label
                  htmlFor="desc"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Description
                </label>
                <textarea
                  id="desc"
                  name="desc"
                  value={formData.desc}
                  onChange={handleInputChange}
                  className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors"
                  placeholder="Enter project description"
                  disabled={createLoading}
                  required
                  rows={5}
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-5 items-center">
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className=" col-span-4 px-0 py-2 pr-8 bg-transparent border-0 border-b-2 border-gray-200 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors [color-scheme:light]"
                    placeholder="dd-mm-yyyy"
                    disabled={createLoading}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={createLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-text-primary rounded-lg text-sm font-medium hover:bg-accent-light transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !formData.name.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {createLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
