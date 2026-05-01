import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from "../../../services/api";
import { useAuth } from "../../AuthContext";
import { MdAdd, MdCalendarToday, MdClose, MdFolder, MdSearch, MdTune } from "react-icons/md";

function normalizeProjects(response) {
  const owner = response?.data?.owner || response?.owner || [];
  const memberOf = response?.data?.memberOf || response?.memberOf || [];
  return [...owner, ...memberOf].filter(Boolean);
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function projectStatus(project) {
  const progress = project.progress || 0;
  if (progress >= 100) return "Completed";
  if (project.dueDate && new Date(project.dueDate) < new Date()) return "Overdue";
  return "Active";
}

function ProjectCard({ project }) {
  const navigate = useNavigate();
  const status = projectStatus(project);
  const remaining = Math.max((project.totalTasks || 0) - (project.completedTasks || 0), 0);
  const badgeClass = status === "Completed" ? "bg-green-500/15 text-green-300" : status === "Overdue" ? "bg-red-500/15 text-red-300" : "bg-blue-500/15 text-blue-300";

  return (
    <button
      type="button"
      onClick={() => navigate(`/projects/${project._id}`)}
      className="group flex min-h-[210px] flex-col rounded-3xl border border-border-default bg-bg-surface p-5 text-left shadow-soft transition hover:border-border-hover hover:bg-bg-surface-hover hover:shadow-large"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-primary/15 text-accent-highlight">
            <MdFolder size={26} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold text-text-primary group-hover:text-accent-highlight">{project.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{project.desc || "No description provided."}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeClass}`}>{status}</span>
      </div>

      <div className="mt-auto pt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-text-secondary">Progress</span>
          <span className="font-bold text-text-primary">{project.progress || 0}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border-track">
          <div className="h-full rounded-full bg-accent-highlight transition-all" style={{ width: `${project.progress || 0}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-default pt-4 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5"><MdCalendarToday size={16} /> {formatDate(project.dueDate)}</span>
          <span>{remaining} task{remaining === 1 ? "" : "s"} remaining</span>
        </div>
      </div>
    </button>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [formData, setFormData] = useState({ name: "", desc: "", dueDate: "" });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.myProjects();
      const base = normalizeProjects(response);
      const enriched = await Promise.all(
        base.map(async (project) => {
          try {
            const progress = await projectService.getProgress(project._id);
            return {
              ...project,
              progress: progress?.data?.percent || 0,
              totalTasks: progress?.data?.total || 0,
              completedTasks: progress?.data?.completed || 0,
            };
          } catch {
            return { ...project, progress: 0, totalTasks: 0, completedTasks: 0 };
          }
        })
      );
      setProjects(enriched);
    } catch (err) {
      console.error("Projects load failed:", err);
      setError("Could not load projects. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const search = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !search || project.name?.toLowerCase().includes(search) || project.desc?.toLowerCase().includes(search);
      const status = projectStatus(project);
      const matchesFilter = filter === "All" || status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, query, filter]);

  const counts = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter((p) => projectStatus(p) === "Active").length,
      completed: projects.filter((p) => projectStatus(p) === "Completed").length,
      overdue: projects.filter((p) => projectStatus(p) === "Overdue").length,
    };
  }, [projects]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateError(null);
    if (!formData.name.trim()) {
      setCreateError("Project name is required.");
      return;
    }
    try {
      setCreating(true);
      const response = await projectService.createProject(
        formData.name.trim(),
        formData.desc.trim() || undefined,
        undefined,
        formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      );
      if (response?.success) {
        setFormData({ name: "", desc: "", dueDate: "" });
        setIsCreateOpen(false);
        await fetchProjects();
      } else {
        setCreateError(response?.error || "Project could not be created.");
      }
    } catch (err) {
      setCreateError(err.response?.data?.error || "Project could not be created.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className="rounded-3xl border border-border-default bg-bg-surface p-6 shadow-soft">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-accent-highlight">Projects</p>
              <h1 className="text-3xl font-bold tracking-tight text-text-primary ">Hello {user?.name || "there"}</h1>
              <p className="mt-2 max-w-2xl text-text-secondary">Create projects, track progress, add members, and keep every task connected to one place.</p>
            </div>
            <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-primary px-5 py-3 text-sm font-bold text-text-on-accent shadow-soft hover:opacity-90">
              <MdAdd size={20} /> Create Project
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-border-default bg-bg-surface p-4"><p className="text-sm text-text-secondary">Total</p><p className="text-3xl font-bold text-text-primary">{counts.total}</p></div>
          <div className="rounded-2xl border border-border-default bg-bg-surface p-4"><p className="text-sm text-text-secondary">Active</p><p className="text-3xl font-bold text-blue-300">{counts.active}</p></div>
          <div className="rounded-2xl border border-border-default bg-bg-surface p-4"><p className="text-sm text-text-secondary">Completed</p><p className="text-3xl font-bold text-green-300">{counts.completed}</p></div>
          <div className="rounded-2xl border border-border-default bg-bg-surface p-4"><p className="text-sm text-text-secondary">Overdue</p><p className="text-3xl font-bold text-red-300">{counts.overdue}</p></div>
        </section>

        <section className="rounded-3xl border border-border-default bg-bg-surface p-5 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <MdSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={22} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search project names or descriptions..."
                className="w-full rounded-2xl border border-border-default bg-bg-main py-3 pl-12 pr-4 text-sm font-medium text-text-primary outline-none focus:border-accent-highlight"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-2xl border border-border-default bg-bg-main px-4 py-3 text-sm font-bold text-text-secondary"><MdTune /> Filter</span>
              {["All", "Active", "Completed", "Overdue"].map((item) => (
                <button key={item} onClick={() => setFilter(item)} className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${filter === item ? "bg-accent-primary text-text-on-accent" : "bg-bg-main text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"}`}>{item}</button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-border-default bg-bg-surface p-10 text-center text-text-secondary">Loading projects...</div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-red-200">{error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border-default bg-bg-surface p-12 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-surface-hover text-accent-highlight"><MdFolder size={30} /></div>
            <h2 className="text-xl font-bold text-text-primary">No projects found</h2>
            <p className="mt-2 text-text-secondary">Try a different search/filter, or create a new project.</p>
            <button onClick={() => setIsCreateOpen(true)} className="mt-5 rounded-2xl bg-accent-primary px-5 py-3 text-sm font-bold text-text-on-accent">Create Project</button>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => <ProjectCard key={project._id} project={project} />)}
          </section>
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onMouseDown={() => setIsCreateOpen(false)}>
          <div className="w-full max-w-xl rounded-3xl border border-border-default bg-bg-surface p-6 shadow-large" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Create project</h2>
                <p className="text-sm text-text-secondary">Add the basic details. You can edit this later.</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-xl bg-bg-surface-hover p-2 text-text-secondary hover:text-text-primary"><MdClose size={22} /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {createError && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{createError}</div>}
              <label className="block"><span className="mb-2 block text-sm font-bold text-text-primary">Project name</span><input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-2xl border border-border-default bg-bg-main px-4 py-3 text-text-primary outline-none focus:border-accent-highlight" placeholder="Example: Final PSM Project" /></label>
              <label className="block"><span className="mb-2 block text-sm font-bold text-text-primary">Description</span><textarea value={formData.desc} onChange={(e) => setFormData((p) => ({ ...p, desc: e.target.value }))} rows={4} className="w-full resize-none rounded-2xl border border-border-default bg-bg-main px-4 py-3 text-text-primary outline-none focus:border-accent-highlight" placeholder="What is this project for?" /></label>
              <label className="block"><span className="mb-2 block text-sm font-bold text-text-primary">Due date</span><input type="date" value={formData.dueDate} onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))} className="w-full rounded-2xl border border-border-default bg-bg-main px-4 py-3 text-text-primary outline-none focus:border-accent-highlight" /></label>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 rounded-2xl border border-border-default px-4 py-3 font-bold text-text-secondary hover:bg-bg-surface-hover">Cancel</button><button disabled={creating} className="flex-1 rounded-2xl bg-accent-primary px-4 py-3 font-bold text-text-on-accent disabled:opacity-60">{creating ? "Creating..." : "Create Project"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
