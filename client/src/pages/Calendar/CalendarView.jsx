import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { MdCalendarToday, MdRefresh, MdTaskAlt } from "react-icons/md";
import { projectService, taskService } from "../../../services/api.js";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function normalizeProjectsResponse(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.owner) || Array.isArray(res?.data?.memberOf)) return [...(res.data.owner || []), ...(res.data.memberOf || [])];
  if (Array.isArray(res?.owner) || Array.isArray(res?.memberOf)) return [...(res.owner || []), ...(res.memberOf || [])];
  return [];
}

function normalizeTasksResponse(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.tasks)) return res.tasks;
  if (Array.isArray(res)) return res;
  return [];
}

function formatDeadline(date) {
  return new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCalendarTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsResponse = await projectService.myProjects();
      const projects = normalizeProjectsResponse(projectsResponse).filter((project) => project?._id);

      const taskGroups = await Promise.all(
        projects.map(async (project) => {
          const taskResponse = await taskService.listTasks(project._id);
          return normalizeTasksResponse(taskResponse).map((task) => ({ ...task, projectName: project.name, projectId: project._id }));
        })
      );

      const nextEvents = taskGroups
        .flat()
        .filter((task) => task?.dueDate)
        .map((task) => {
          const start = new Date(task.dueDate);
          const end = new Date(start);
          end.setHours(end.getHours() + 1);
          return {
            id: task._id,
            title: `${task.title || "Task"}`,
            start,
            end,
            allDay: true,
            resource: task,
          };
        });

      setEvents(nextEvents);
    } catch (err) {
      console.error("Failed to load calendar tasks:", err);
      setError("Calendar could not load task deadlines.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarTasks();
  }, []);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((event) => event.start >= today)
      .sort((a, b) => a.start - b.start)
      .slice(0, 6);
  }, [events]);

  const overdueCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((event) => event.start < today && event.resource?.status !== "Completed").length;
  }, [events]);

  return (
    <div className="min-h-screen bg-bg-main p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className="rounded-3xl border border-border-default bg-bg-surface p-6 shadow-soft">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-accent-highlight">Calendar</p>
              <h1 className="text-3xl font-bold tracking-tight text-text-primary ">Deadlines at a glance</h1>
              <p className="mt-2 max-w-2xl text-text-secondary">Every task with a due date appears here so users do not need to hunt through each project.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-2xl border border-border-default bg-bg-main px-4 py-3 text-sm font-bold text-text-secondary">{upcomingEvents.length} upcoming</span>
              <span className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{overdueCount} overdue</span>
              <button type="button" onClick={loadCalendarTasks} className="inline-flex items-center gap-2 rounded-2xl bg-accent-primary px-4 py-3 text-sm font-bold text-text-on-accent"><MdRefresh size={18} /> Refresh</button>
            </div>
          </div>
        </section>

        {error && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-border-default bg-bg-surface p-4 shadow-soft lg:p-6">
            {loading ? (
              <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-border-default bg-bg-main text-text-secondary">Loading calendar...</div>
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "72vh" }}
                views={["month"]}
                defaultView="month"
                popup
                tooltipAccessor={(event) => `${event.title} • ${event.resource?.projectName || "Project"}`}
              />
            )}
          </div>

          <aside className="rounded-3xl border border-border-default bg-bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-primary/15 text-accent-highlight"><MdCalendarToday size={24} /></div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">Upcoming</h2>
                <p className="text-sm text-text-secondary">Next visible deadlines</p>
              </div>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-default bg-bg-main p-8 text-center text-text-secondary">No upcoming task deadlines.</div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-border-default bg-bg-main p-4">
                    <div className="flex items-start gap-3">
                      <MdTaskAlt className="mt-0.5 shrink-0 text-accent-highlight" size={20} />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-text-primary">{event.title}</p>
                        <p className="truncate text-sm text-text-secondary">{event.resource?.projectName || "Project"}</p>
                        <p className="mt-2 text-xs font-bold text-text-muted">{formatDeadline(event.start)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}
