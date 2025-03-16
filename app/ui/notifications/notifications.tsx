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
  const [error, setError] = useState<string | null>(null);

  const userId = "some-user-id"; // 🔹 Replace with actual user ID (from auth state)

  useEffect(() => {
    if (!userId) return; // Ensure userId exists before fetching

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications(); // Initial fetch

    const interval = setInterval(fetchNotifications, 60000); // ✅ Fetch every 60 seconds
    return () => clearInterval(interval); // ✅ Cleanup on unmount

  }, [userId]); // ✅ Dependency array only includes userId

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">🔔 Notifications</h2>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notif) => (
            <li key={notif.id} className="p-2 border rounded bg-gray-100">
              <span className="text-sm">{notif.message}</span>
              <span className="text-xs text-gray-500 ml-2">
                ({new Date(notif.createdAt).toLocaleTimeString()})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
