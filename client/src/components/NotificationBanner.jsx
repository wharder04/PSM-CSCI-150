import { useEffect, useState } from "react";
import { MdNotifications, MdDone, MdClear } from "react-icons/md";
import { notificationService } from "../../services/api";

export default function NotificationBanner() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadUnread = async () => {
        try {
            const response = await notificationService.getUnread();
            console.log("Unread notifications full response:", response);
            console.log("Unread notifications data field:", response?.data);
            setNotifications(response?.data || []);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnread();

        const interval = setInterval(loadUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markRead(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications([]);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    if (loading || notifications.length === 0) return null;

    return (
        <div className="sticky top-0 z-40 p-4 border-b border-border-default bg-yellow-50 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="mt-1 text-yellow-700">
                    <MdNotifications size={24} />
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                            <h3 className="text-sm font-bold text-yellow-900">
                                You have {notifications.length} new notification
                                {notifications.length === 1 ? "" : "s"}
                            </h3>
                            <p className="text-xs text-yellow-800">
                                New assignments, task comments, and discussion updates since you were away.
                            </p>
                        </div>

                        <button
                            onClick={handleMarkAllRead}
                            className="px-3 py-2 rounded-lg text-xs font-semibold bg-yellow-700 text-white hover:bg-yellow-800"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="space-y-2">
                        {notifications.slice(0, 5).map((notification) => (
                            <div
                                key={notification._id}
                                className="flex items-start justify-between gap-3 rounded-xl border border-yellow-200 bg-white px-3 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleMarkRead(notification._id)}
                                        className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                                        title="Mark as read"
                                    >
                                        <MdDone size={18} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(notification._id)}
                                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                        title="Dismiss"
                                    >
                                        <MdClear size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {notifications.length > 5 && (
                        <p className="text-xs text-yellow-800 mt-3">
                            Showing 5 most recent unread notifications.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}