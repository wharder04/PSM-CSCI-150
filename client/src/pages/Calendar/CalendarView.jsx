import React, { useState, useEffect, useMemo, useRef} from "react";
import { projectService, taskService } from "../../../services/api.js";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  //State Variables
  const [events, setEvents] = useState([]);

  const [rawTasks, setRawTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //reference to store project color mapping
  const projectColorMap = useRef(new Map());

  //Data fetching
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all projects
        const res = await projectService.myProjects();
        const allProjects = [
          ...(res?.data?.owner || []),
          ...(res?.data?.memberOf || []),
        ];

        // Create an array of API calls
        const taskPromises = allProjects.map((p) =>
          taskService.listTasks(p._id)
        );

        // Execute calls concurrently
        const taskResults = await Promise.all(taskPromises);

        // Flatten the array of arrays into single list of tasks
        const combinedTasks = taskResults.flatMap((result) =>
          result?.success ? result.data : result?.data || []
        );

        console.log("Raw fetched tasks:", combinedTasks);
        setRawTasks(combinedTasks);

      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to load calendar data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, []);

  //Transform tasks into Calendar Events
  const calendarEvents = useMemo(() => {
    return rawTasks
      .filter((task) => task.dueDate) // Ignore tasks without dates
      .map((task) => {
        const taskDate = new Date(task.dueDate);
        const pId = task.projectId; 

        // Default fallback color if a task somehow has nn project
        let eventColor = "var(--project1-color)"; 

        if (pId) {
          if (!projectColorMap.current.has(pId)) {
            // Calculate an index from 1 to 8
            //.size gets the current number of unique projects,
            // modulo 8 keeps color mapping within range
            const nextColorIndex = (projectColorMap.current.size % 8) + 1;
            projectColorMap.current.set(pId, `var(--project${nextColorIndex}-color)`);
          }
          eventColor = projectColorMap.current.get(pId);
        }

        return {
          id: task._id,
          title: task.title,
          start: taskDate,
          end: taskDate,
          color: eventColor,
          resource: task, 
        };
      });
  }, [rawTasks]);

  //create styling for calendar events
  const customEventStyle = (event) => {
    return {
      style: {
        backgroundColor: event.color, // Pull the color we mapped above
        border: "none",
        color: "#ffffff",
        borderRadius: "4px",
        display: "block",
      },
    };
  };


  return (
    <div className="min-h-screen w-full p-2 bg-bg-main">
      <div className="mb-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Calendar</h1>
        <p className="text-base text-text-secondary">View your upcoming events and deadlines</p>
      </div>
      <div className="max-w-7xl bg-bg-surface text-text-primary border border-border-default rounded-2xl p-6 shadow-soft">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={customEventStyle}
          style={{ height: "80vh" }}
          views={["month"]}
          defaultView="month"
        />
      </div>
    </div>
  );
}
