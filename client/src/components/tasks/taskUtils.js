export const STATUS = {
  UNASSIGNED: "UnAssigned",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "InProgress",
  COMPLETED: "Completed",
  INCOMPLETE: "InComplete",
};

export const COLUMNS = [
  {
    id: STATUS.UNASSIGNED,
    title: "Unassigned",
    description: "Tasks waiting for an assignee",
  },
  {
    id: STATUS.IN_PROGRESS,
    title: "In Progress",
    description: "Tasks actively being worked on",
  },
  {
    id: STATUS.COMPLETED,
    title: "Completed",
    description: "Finished tasks",
  },
  {
    id: STATUS.INCOMPLETE,
    title: "Incomplete",
    description: "Blocked or unfinished tasks",
  },
];

export function formatNiceDate(value) {
  if (!value) return "No due date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "No due date";

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function priorityPillClasses(priority) {
  const p = (priority || "").toLowerCase();

  if (p === "high") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  if (p === "medium") {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }

  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
}

export function isTaskOverdue(task) {
  if (!task?.dueDate) return false;
  if (task?.status === STATUS.COMPLETED) return false;

  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return false;

  return due < new Date();
}

export const UNASSIGNED_SYSTEM_EMAIL = "unassigned@system.local";
export const UNASSIGNED_SYSTEM_KEY = "UNASSIGNED_PLACEHOLDER";

export function isSystemUnassignedUser(value) {
  if (!value) return true;
  if (typeof value === "string") {
    const text = value.trim().toLowerCase();
    return text === "" || text === "unassigned" || text === "unassignee" || text === UNASSIGNED_SYSTEM_EMAIL;
  }

  return (
    value.isSystemPlaceholder === true ||
    value.systemKey === UNASSIGNED_SYSTEM_KEY ||
    String(value.email || "").toLowerCase() === UNASSIGNED_SYSTEM_EMAIL
  );
}

export function getTaskAssignedUser(task) {
  const user = task?.assignedTo || task?.assignee || null;
  return isSystemUnassignedUser(user) ? null : user;
}

export function getTaskAssignedUserId(task) {
  const user = getTaskAssignedUser(task);
  return user?._id || (typeof user === "string" ? user : "") || "";
}
