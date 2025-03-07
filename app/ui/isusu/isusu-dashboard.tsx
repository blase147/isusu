"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function IsusuDashboard() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") as string;

  const [members, setMembers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; contributions: number }[]>([]);
  const [activities, setActivities] = useState<{ id: string; description: string }[]>([]);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/isusu/members?isusuId=${id}`)
      .then((res) => res.json())
      .then((data) => setMembers(data.members));

    fetch(`/api/isusu/leaderboard?isusuId=${id}`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard));

    fetch(`/api/isusu/activities?isusuId=${id}`)
      .then((res) => res.json())
      .then((data) => setActivities(data.activities));
  }, [id]);

  return (
    <div className="container mx-auto p-6">
      {/* Dashboard Header */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6">📊 Isusu Members Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">🏆 Leaderboard</h3>
          <ul className="space-y-3">
            {leaderboard.length > 0 ? (
              leaderboard.map((member, index) => (
                <li key={index} className="flex justify-between text-gray-600">
                  <span>
                    {index + 1}. {member.name}
                  </span>
                  <span className="font-bold">{member.contributions} Contributions</span>
                </li>
              ))
            ) : (
              <p className="text-gray-400">No contributions yet.</p>
            )}
          </ul>
        </div>

        {/* Members List */}
        <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">👥 Members</h3>
          <ul className="space-y-2">
            {members.length > 0 ? (
              members.map((member) => (
                <li key={member.id} className="flex justify-between text-gray-600">
                  {member.name} <span className="text-gray-400">{member.email}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-400">No members found.</p>
            )}
          </ul>
        </div>

        {/* Timeline */}
        <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">📜 Timeline</h3>
          <ul className="space-y-2">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <li key={activity.id} className="text-gray-600">
                  ➜ {activity.description}
                </li>
              ))
            ) : (
              <p className="text-gray-400">No recent activities.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Chat Box */}
      <div className="mt-8 bg-white shadow-md rounded-lg p-5 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">💬 Chat</h3>
        <textarea
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
        ></textarea>
        <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Send
        </button>
      </div>
    </div>
  );
}
