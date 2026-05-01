import { useEffect, useRef, useState } from "react";
import { MdNotificationsNone } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../services/api";

function normalizeNotifications(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.notifications)) return response.notifications;
    if (Array.isArray(response?.data)) return response.data;
    return [];
}

function isNotificationRead(notification) {
    return Boolean(notification?.isRead ?? notification?.read);
}

function getNotificationProjectId(notification) {
    return notification?.project?._id || notification?.project || notification?.projectId;
}

function getNotificationTaskId(notification) {
    return notification?.task?._id || notification?.task || notification?.taskId;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter((n) => !isNotificationRead(n)).length;

    const loadNotifications = async () => {
        try {
            const response = await notificationService.getNotifications();
            setNotifications(normalizeNotifications(response));
        } catch (err) {
            console.error("Error loading notifications:", err);
        }
    };

    useEffect(() => {
        loadNotifications();

        const interval = setInterval(() => {
            loadNotifications();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markLocalRead = (notificationId) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n._id === notificationId ? { ...n, read: true, isRead: true } : n
            )
        );
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (notification._id && !isNotificationRead(notification)) {
                markLocalRead(notification._id);
                await notificationService.markOneRead(notification._id);
            }

            setIsOpen(false);

            const taskId = getNotificationTaskId(notification);
            const projectId = getNotificationProjectId(notification);

            if (taskId) {
                navigate("/tasks");
            } else if (projectId) {
                navigate("/projects/" + projectId);
            } else {
                navigate("/home");
            }
        } catch (err) {
            console.error("Error opening notification:", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
            await notificationService.markAllRead();
        } catch (err) {
            console.error("Error marking all notifications read:", err);
            loadNotifications();
        }
    };

    return (
        <div className="relative" ref={bellRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-2.5 bg-bg-surface border border-border-default rounded-lg cursor-pointer hover:border-border-hover transition-colors flex items-center justify-center"
            >
                <MdNotificationsNone className="text-text-primary" size={20} />

                {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-5 h-5 px-1 flex items-center justify-center rounded-full border-2 border-bg-main shadow-sm">
                        {unreadCount}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto bg-bg-surface border border-border-default rounded-xl shadow-large z-[9999] p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-text-primary">
                            Notifications
                        </h3>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="text-xs text-accent-highlight hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <p className="text-sm text-text-secondary">
                            No notifications.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {notifications.map((notification) => {
                                const read = isNotificationRead(notification);

                                return (
                                    <button
                                        key={notification._id}
                                        type="button"
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`text-left p-3 rounded-lg border transition-colors ${read
                                                ? "bg-bg-main border-border-default"
                                                : "bg-blue-500/10 border-blue-400"
                                            } hover:bg-bg-surface-hover`}
                                    >
                                        <p className="text-sm font-semibold text-text-primary mb-1">
                                            {notification.title || "New update"}
                                        </p>

                                        <p className="text-xs text-text-secondary">
                                            {notification.message ||
                                                "There was a recent project or task update."}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
