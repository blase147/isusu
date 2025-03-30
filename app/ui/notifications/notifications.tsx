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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");
        const data = await response.json();

        if (response.ok) {
          setNotifications(data);
        } else {
          setError(data.error || "Failed to load notifications.");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message || "Network error. Please try again.");
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Notifications</h2>

      {loading && (
        <p className="text-gray-500 animate-pulse">Loading notifications...</p>
      )}

      {error && (
        <p className="text-red-500 bg-red-100 p-2 rounded-md">{error}</p>
      )}

      {notifications.length > 0 ? (
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 border rounded-md bg-gray-50 hover:bg-gray-100 transition"
            >
              <p className="text-gray-800">{notification.message}</p>
              <small className="text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-gray-500 italic">No notifications yet.</p>
        )
      )}
    </div>
  );
}
