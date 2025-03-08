"use client"; // ✅ Add this at the very top

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function IsusuDashboard() {
  const { id } = useParams(); // Ensure `id` is correctly retrieved
  console.log("📌 Retrieved isusuId from params:", id);

  // 🛠️ State Management
  const [members, setMembers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; contributions: number }[]>([]);
  const [activities, setActivities] = useState<{ id: string; description: string; timestamp: string }[]>([]);

  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // Prevent API calls if `id` is missing

    const fetchData = async () => {
      try {
        setError(null);

        // Fetch Members
        const membersRes = await fetch(`/api/isusu/members?isusuId=${id}`);
        if (!membersRes.ok) throw new Error("Failed to load members");
        const membersData = await membersRes.json();
        setMembers(Array.isArray(membersData.members) ? membersData.members : []);
        setLoadingMembers(false);

        // Fetch Leaderboard
        const leaderboardRes = await fetch(`/api/isusu/leaderboard?isusuId=${id}`);
        if (!leaderboardRes.ok) throw new Error("Failed to load leaderboard");
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.leaderboard || []);
        setLoadingLeaderboard(false);

        // Fetch Activities
        const activitiesRes = await fetch(`/api/isusu/activities?isusuId=${id}`);
        if (!activitiesRes.ok) throw new Error("Failed to load activities");
        const activitiesData = await activitiesRes.json();
        setActivities(Array.isArray(activitiesData.activities) ? activitiesData.activities : []);
        setLoadingActivities(false);

      } catch (err: unknown) {
        console.error("❌ Fetch Error:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="container mx-auto p-6">
      {/* Dashboard Header */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6">📊 Isusu Members Dashboard</h2>

      {/* Show error message if any */}
      {error && <p className="text-red-500 font-semibold">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <Leaderboard leaderboard={leaderboard} loading={loadingLeaderboard} />

        {/* Members List */}
        <MembersList members={members} loading={loadingMembers} />

        {/* Activities Timeline */}
        <ActivitiesTimeline activities={activities} loading={loadingActivities} />
      </div>

      {/* Chat Box */}
      <ChatBox />
    </div>
  );
}

/* 🏆 Leaderboard Component */
const Leaderboard = ({ leaderboard, loading }: { leaderboard: { name: string; contributions: number }[], loading: boolean }) => (
  <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200">
    <h3 className="text-xl font-semibold mb-4 text-gray-700">🏆 Leaderboard</h3>
    <ul className="space-y-3">
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <li key={i} className="text-gray-400 animate-pulse">Loading...</li>)
      ) : leaderboard.length > 0 ? (
        leaderboard.map((member, index) => (
          <li key={index} className="flex justify-between text-gray-600">
            <span>{index + 1}. {member.name}</span>
            <span className="font-bold">{member.contributions} Contributions</span>
          </li>
        ))
      ) : (
        <li className="text-gray-400">No contributions yet.</li>
      )}
    </ul>
  </div>
);

/* 👥 Members List Component */
const MembersList = ({ members, loading }: { members: { id: string; name: string; email: string }[], loading: boolean }) => (
  <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200">
    <h3 className="text-xl font-semibold mb-4 text-gray-700">👥 Members</h3>
    <ul className="space-y-2">
      {loading ? (
        Array.from({ length: 2 }).map((_, i) => <li key={i} className="text-gray-400 animate-pulse">Loading...</li>)
      ) : members.length > 0 ? (
        members.map((member) => (
          <li key={member.id} className="flex justify-between text-gray-600">
            {member.name} <span className="text-gray-400">{member.email}</span>
          </li>
        ))
      ) : (
        <li className="text-gray-400">No members found.</li>
      )}
    </ul>
  </div>
);

/* 📜 Activities Timeline Component */
const ActivitiesTimeline = ({ activities, loading }: { activities: { id: string; description: string; timestamp: string }[], loading: boolean }) => (
  <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200">
    <h3 className="text-xl font-semibold mb-4 text-gray-700">📜 Timeline</h3>
    <ul className="space-y-3">
      {loading ? (
        Array.from({ length: 2 }).map((_, i) => <li key={i} className="text-gray-400 animate-pulse">Loading...</li>)
      ) : activities.length > 0 ? (
        activities.map((activity) => (
          <li key={activity.id} className="text-gray-600 flex items-center space-x-2">
            <span className="text-xl">{getActivityIcon(activity.description)}</span>
            <div>
              <p>{activity.description}</p>
              <p className="text-sm text-gray-400">{formatDate(activity.timestamp)}</p>
            </div>
          </li>
        ))
      ) : (
        <li className="text-gray-400">No recent activities.</li>
      )}
    </ul>
  </div>
);

/* 💬 Chat Box Component */
const ChatBox = () => (
  <div className="mt-8 bg-white shadow-md rounded-lg p-5 border border-gray-200 w-[20%]">
    <h3 className="text-xl font-semibold mb-4 text-gray-700">💬 Chat</h3>
    <textarea
      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="Type your message..."
    ></textarea>
    <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
      Send
    </button>
  </div>
);

/* 🔄 Utility Functions */
const getActivityIcon = (description: string) => {
  if (description.includes("contributed")) return "💰";
  if (description.includes("joined")) return "🎉";
  if (description.includes("payout")) return "🏆";
  return "📌";
};

const formatDate = (timestamp: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(timestamp));
};
