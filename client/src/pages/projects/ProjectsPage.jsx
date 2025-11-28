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
  name,
  className,
  dueDate,
  status,
  progress,
  remainingTasks,
  incompleteTasks,
}) {
  const navigate = useNavigate();

  const tasks =
    remainingTasks !== undefined
      ? Number(remainingTasks)
      : incompleteTasks !== undefined
      ? Number(incompleteTasks)
      : status === "Completed"
      ? 0
      : null;
  const allTasksDone = tasks === 0 || status === "Completed";

  const percent = Number(progress);
  const effectiveProgress = Number.isNaN(percent)
    ? allTasksDone
      ? 100
      : 0
    : percent;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    let date;
    if (dateString.includes("/")) {
      const [month, day, year] = dateString.split("/");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      date = new Date(dateString);
    }
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
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const handleCardClick = () => {
    navigate(`/projects/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-panel rounded-2xl p-6 shadow-soft border border-border hover:-translate-y-1 hover:shadow-large hover:border-accent-light transition-all duration-300 flex flex-col gap-5 cursor-pointer"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-text-primary mb-1.5 leading-tight hover:text-blue-500 hover:underline">
            {name}
          </h3>
          <p className="text-sm text-text-secondary">{className}</p>
        </div>
        <span
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide flex-shrink-0 ${
            status === "In Progress"
              ? "bg-panel-muted text-accent-mid"
              : status === "Completed"
              ? "bg-panel-muted text-accent-dark"
              : status === "Overdue"
              ? "bg-panel-muted text-accent-dark"
              : "bg-panel-muted text-accent-mid"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="flex-1">
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-sm text-text-secondary font-medium">
              {allTasksDone
                ? "All Tasks Completed"
                : tasks !== null
                ? `${tasks} Incomplete Tasks`
                : "In Progress"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MdCalendarToday size={16} className="text-text-muted" />
            <span className="text-xs text-text-secondary">
              {formatDate(dueDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-4 border-t border-panel-muted">
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-secondary font-medium">
            Progress
          </span>
          <span className="text-sm text-text-primary font-bold">
            {effectiveProgress}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-panel-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-accent-dark transition-all duration-300"
            style={{ width: `${effectiveProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Active");
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

        // Map API response to component format
        const mappedProjects = allProjects.map((project) => {
          const dueDate = project.dueDate ? new Date(project.dueDate) : null;
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          let status = "In Progress";
          if (dueDate) {
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate < now) {
              status = "Overdue";
            }
          }

          // Format date for display
          const formatDate = (date) => {
            if (!date) return "";
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

          return {
            id: project._id,
            name: project.name,
            className: project.desc || "No description",
            dueDate: dueDate ? formatDate(dueDate) : "",
            status: status,
            progress: 0, // Default, can be calculated from tasks later
            remainingTasks: null,
            incompleteTasks: null,
            startDate: project.startDate,
            description: project.desc,
          };
        });

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
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Active" &&
        (project.status === "In Progress" || project.status === "Overdue")) ||
      (activeFilter === "Completed" && project.status === "Completed");

    const matchesSearch =
      !searchQuery ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            className="w-full pl-12 pr-4 py-3.5 bg-panel border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-mid focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-3 bg-panel px-2 py-2 rounded-xl border border-border">
          <MdFilterList size={20} className="text-text-secondary ml-2" />
          <div className="flex gap-1">
            {["All", "Active", "Completed"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
          <div className="text-center py-20 bg-panel rounded-2xl border border-border">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-dark mb-4"></div>
            <p className="text-sm text-text-secondary">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-panel rounded-2xl border border-border">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Error loading projects
            </h3>
            <p className="text-sm text-text-secondary mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent-dark text-white rounded-lg text-sm font-medium hover:bg-accent-mid transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                className={project.className}
                dueDate={project.dueDate}
                status={project.status}
                progress={project.progress}
                remainingTasks={project.remainingTasks}
                incompleteTasks={project.incompleteTasks}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-panel rounded-2xl border border-border">
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
                className="text-text-muted hover:text-text-primary transition-colors p-1"
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
                  className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors"
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
                  className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors"
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
                    className=" col-span-4 px-0 py-2 pr-8 bg-transparent border-0 border-b-2 border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-dark transition-colors [color-scheme:light]"
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
                  className="flex-1 px-4 py-2.5 bg-panel-muted text-text-primary rounded-lg text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !formData.name.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
