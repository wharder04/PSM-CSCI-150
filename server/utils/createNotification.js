import Notification from "../models/Notificationmodel.js";

export default async function createNotification({
  user,
  actor,
  project = null,
  task = null,
  type,
  message,
}) {
  console.log("createNotification called with:", {
    user,
    actor,
    project,
    task,
    type,
    message,
  });

  if (!user || !actor || !type || !message) {
    console.log("Notification skipped: missing required field");
    return null;
  }

  if (String(user) === String(actor)) {
    console.log("Notification skipped: user and actor are the same");
    return null;
  }

  const created = await Notification.create({
    user,
    actor,
    project,
    task,
    type,
    message,
    isRead: false,
  });

  console.log("Notification created:", created._id);

  return created;
}