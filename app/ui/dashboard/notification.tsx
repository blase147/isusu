"use client";

import { useEffect, useState } from "react";

interface Notification {
    id: string;
    userId: string;
    isusuId?: string;
    type: string;
    message: string;
    createdAt: string;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [error, setError] = useState<string | null>(null);

    // 📌 Fetch Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/notifications");
                if (!res.ok) throw new Error("Failed to fetch notifications");
                const data = await res.json();
                setNotifications(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // 📌 Create Notification
    const createNotification = async () => {
        if (!newMessage) return alert("Message is required!");

        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: "some-user-id", // Replace with actual user ID
                    type: "general",
                    message: newMessage,
                }),
            });

            if (!res.ok) throw new Error("Failed to create notification");

            const newNotification = await res.json();
            setNotifications([newNotification, ...notifications]);
            setNewMessage("");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    // 📌 Delete Notification
    const deleteNotification = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete notification");

            setNotifications(notifications.filter((notif) => notif.id !== id));
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    return (
        <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">🔔 Notifications</h2>

            {error && <p className="text-red-500">{error}</p>}

            {/* Add Notification */}
            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    className="border p-2 flex-grow rounded"
                    placeholder="Enter notification message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={createNotification}
                >
                    Add
                </button>
            </div>

            {/* Loading State */}
            {loading ? <p>Loading...</p> : null}

            {/* Notification List */}
            {notifications.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                <ul className="space-y-2">
                    {notifications.map((notif) => (
                        <li key={notif.id} className="flex justify-between items-center p-2 border rounded">
                            <span>{notif.message}</span>
                            <button
                                className="text-red-500"
                                onClick={() => deleteNotification(notif.id)}
                            >
                                ❌
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
