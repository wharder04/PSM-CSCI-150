export const STATUS = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "InProgress",
  COMPLETED: "Completed",
  INCOMPLETE: "InComplete",
};

// Four columns as shown in your screenshots.
export const COLUMNS = [
  { id: STATUS.ASSIGNED, title: "Assigned" },
  { id: STATUS.IN_PROGRESS, title: "In Progress" },
  { id: STATUS.COMPLETED, title: "Completed" },
  { id: STATUS.INCOMPLETE, title: "Incomplete" },
];

export const PRIORITIES = ["High", "Medium", "Low"];

export function formatNiceDate(value) {
  if (!value) return "No date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function priorityPillClasses(priority) {
  const p = (priority || "").toLowerCase();
  if (p.includes("high")) return "bg-red-100 text-red-700";
  if (p.includes("medium")) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}