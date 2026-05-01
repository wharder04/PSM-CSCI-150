import Notification from "../models/Notificationmodel.js";

function serializeNotification(notification) {
  const item = notification?.toObject ? notification.toObject() : notification;
  return {
    ...item,
    read: Boolean(item?.isRead),
    projectId: item?.project?._id || item?.project || null,
    taskId: item?.task?._id || item?.task || null,
  };
}

export async function getMyNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate("actor", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: notifications.map(serializeNotification) });
  } catch (e) {
    next(e);
  }
}

export async function getUnreadNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
      isRead: false,
    })
      .populate("actor", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: notifications.map(serializeNotification) });
  } catch (e) {
    next(e);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    )
      .populate("actor", "name email")
      .populate("project", "name");

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }

    res.json({ success: true, data: serializeNotification(notification) });
  } catch (e) {
    next(e);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, data: true, modifiedCount: result.modifiedCount || 0 });
  } catch (e) {
    next(e);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      user: req.user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }

    res.json({ success: true, data: { _id: req.params.notificationId } });
  } catch (e) {
    next(e);
  }
}
