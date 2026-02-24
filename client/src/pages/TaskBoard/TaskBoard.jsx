import { useState, useEffect } from "react";
import tasksData from "../../data/tasks.json";
import { MdFilterList, MdAdd, MdCalendarToday } from "react-icons/md";

function TaskCard({ task }) {
  const getPriorityClass = (priority) => {
    const priorityLower = priority?.toLowerCase() || "";
    if (priorityLower.includes("high")) return "bg-bg-surface-hover text-text-primary";
    if (priorityLower.includes("medium"))
      return "bg-bg-surface-hover text-text-secondary";
    return "bg-bg-surface-hover text-text-muted";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    if (dateString.includes("/")) {
      const [month, day, year] = dateString.split("/");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
    }
    return dateString;
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-4 cursor-grab hover:bg-bg-surface-hover hover:border-border-hover hover:shadow-large hover:-translate-y-0.5 transition-all duration-200 active:cursor-grabbing relative">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-semibold text-text-primary flex-1 leading-snug pr-2">
          {task.name}
        </h3>
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide flex-shrink-0 ${getPriorityClass(
            task.priority
          )}`}
        >
          {task.priority}
        </span>
      </div>
      {task.assignedTo && (
        <div className="mb-3">
          <p className="text-xs text-text-secondary">
            Assigned to: {task.assignedTo}
          </p>
        </div>
      )}
      <div className="flex items-center gap-1.5 pt-3 border-t border-border-default">
        <MdCalendarToday size={14} className="text-text-muted" />
        <span className="text-xs text-text-secondary">
          {formatDate(task.dateAssigned || task.dueDate)}
        </span>
      </div>
    </div>
  );
}

function TaskBoard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    setTasks(tasksData);
  }, []);

  const unAssignedTasks = tasks.filter(
    (task) => !task.assignedTo || task.assignedTo.trim() === ""
  );
  const assignedTasks = tasks.filter(
    (task) => task.assignedTo && task.assignedTo.trim() !== ""
  );
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress");
  const completedTasks = tasks.filter((task) => task.status === "Completed");
  const incompleteTasks = tasks.filter(
    (task) => task.status === "Incomplete" || task.status === "Overdue"
  );

  const columns = [
    { id: "unassigned", title: "Unassigned", tasks: unAssignedTasks },
    { id: "assigned", title: "Assigned", tasks: assignedTasks },
    { id: "in-progress", title: "In Progress", tasks: inProgressTasks },
    { id: "completed", title: "Completed", tasks: completedTasks },
    { id: "incomplete", title: "Incomplete", tasks: incompleteTasks },
  ];

  return (
    <div className="min-h-screen w-full p-2 bg-bg-main">
      <div className="mb-8 max-w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
            Task Board
          </h1>
          <p className="text-base text-text-secondary mb-6">
            Drag and drop tasks to update their status
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-bg-surface border border-border-default rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-surface-hover hover:border-border-hover hover:text-text-primary transition-all duration-200 cursor-pointer">
            <MdFilterList size={18} />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-text-on-accent rounded-xl text-sm font-semibold shadow-medium hover:-translate-y-0.5 hover:shadow-large transition-all duration-200 cursor-pointer">
            <MdAdd size={18} />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-5 max-w-full">
        {columns.map((column) => (
          <div
            key={column.id}
            className="min-w-[300px] max-w-[300px] bg-bg-surface rounded-2xl p-5 shadow-soft border border-border-default flex flex-col h-fit max-h-[calc(100vh-200px)]"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-border-default">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-text-primary">
                  {column.title}
                </span>
                <span className="bg-bg-surface-hover text-text-secondary px-2.5 py-1 rounded-xl text-xs font-semibold">
                  {column.tasks.length}
                </span>
              </div>
              <button className="w-7 h-7 rounded-lg border border-border-default bg-bg-surface text-text-secondary transition-all duration-200 flex items-center justify-center text-lg font-light cursor-pointer hover:bg-bg-surface-hover hover:text-text-primary">
                <MdAdd size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
              {column.tasks.length > 0 ? (
                column.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="text-center py-10 text-text-muted text-sm">
                  No tasks in this column
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskBoard;
