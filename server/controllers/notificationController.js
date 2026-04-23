import Notification from "../models/Notificationmodel.js";

export async function getMyNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate("actor", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: notifications });
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

    res.json({ success: true, data: notifications });
  } catch (e) {
    next(e);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (e) {
    next(e);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, data: true });
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