import Notification from "../models/Notificationmodel.js";
import User from "../models/User.js";
import { isSystemPlaceholderUser, isValidObjectId, sameId } from "./systemUsers.js";

export default async function createNotification({
  user,
  actor,
  project = null,
  task = null,
  type,
  message,
}) {
  const userId = user?._id || user;
  const actorId = actor?._id || actor;

  if (!userId || !actorId || !type || !message) return null;
  if (!isValidObjectId(userId) || !isValidObjectId(actorId)) return null;
  if (sameId(userId, actorId)) return null;

  const notificationUser = await User.findById(userId).select("email isSystemPlaceholder systemKey");
  if (!notificationUser || isSystemPlaceholderUser(notificationUser)) return null;

  return Notification.create({
    user: userId,
    actor: actorId,
    project,
    task,
    type,
    message,
    isRead: false,
  });
}
