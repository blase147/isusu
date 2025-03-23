"use client";

import { useEffect, useState } from "react";

const MembersList = ({ isusuId }: { isusuId: string }) => {
  const [members, setMembers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!isusuId) return;

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/isusu/members-list?isusuId=${isusuId}`);
      const data = await response.json();

      console.log("Fetched members:", data); // 🔍 Debugging log

      if (!data.members || data.members.length === 0) {
        setError("No members found.");
      } else {
        setMembers(data.members);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members.");
    }
  };

  fetchMembers();
}, [isusuId]);


  if (error) return <p className="text-red-500">{error}</p>;
  if (members.length === 0) return <p>No members found.</p>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">👥 Members</h2>
      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.id} className="p-2 border-b">
            <p className="font-medium">{member.name}</p>
            <p className="text-gray-500 text-sm">{member.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MembersList;
