"use client";

import { useEffect, useState } from "react";

interface IsusuDashboardProps {
  isusuId: string;
}

export default function IsusuDashboard({ isusuId }: IsusuDashboardProps) {
  const [members, setMembers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; contributions: number }[]>([]);
  const [activities, setActivities] = useState<{ id: string; description: string }[]>([]);

  useEffect(() => {
    fetch(`/api/isusu/members?isusuId=${isusuId}`)
      .then(res => res.json())
      .then(data => setMembers(data.members));

    fetch(`/api/isusu/leaderboard?isusuId=${isusuId}`)
      .then(res => res.json())
      .then(data => setLeaderboard(data.leaderboard));

    fetch(`/api/isusu/activities?isusuId=${isusuId}`)
      .then(res => res.json())
      .then(data => setActivities(data.activities));
  }, [isusuId]);

  return (
    <div className="dashboard">
      <h2>Isusu Members Dashboard</h2>

      {/* Leaderboard */}
      <div className="leaderboard">
        <h3>🏆 Leaderboard</h3>
        <ul>
          {leaderboard.map((member, index) => (
            <li key={index}>
              {index + 1}. {member.name} - {member.contributions} Contributions
            </li>
          ))}
        </ul>
      </div>

      {/* Members List */}
      <div className="members">
        <h3>👥 Members</h3>
        <ul>
          {members.map(member => (
            <li key={member.id}>{member.name} ({member.email})</li>
          ))}
        </ul>
      </div>

      {/* Timeline */}
      <div className="timeline">
        <h3>📜 Timeline</h3>
        <ul>
          {activities.map(activity => (
            <li key={activity.id}>{activity.description}</li>
          ))}
        </ul>
      </div>

      {/* Chat Box */}
      <div className="chatbox">
        <h3>💬 Chat</h3>
        <textarea placeholder="Type your message..."></textarea>
        <button>Send</button>
      </div>
    </div>
  );
}
