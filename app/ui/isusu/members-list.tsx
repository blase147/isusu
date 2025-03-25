"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const MembersList = ({ isusuId }: { isusuId: string }) => {
  const [members, setMembers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // ✅ Added loading state

  useEffect(() => {
    if (!isusuId) return;

    const fetchMembers = async () => {
      try {
        setLoading(true); // Start loading
        const response = await fetch(`/api/isusu/members-list?isusuId=${isusuId}`);
        if (!response.ok) throw new Error("Failed to fetch members");

        const data = await response.json();
        console.log("Fetched members:", data); // 🔍 Debugging log

        if (!data.members || data.members.length === 0) {
          setError("No members found.");
        } else {
          setMembers(data.members);
          setError(null); // Clear any previous errors
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchMembers();
  }, [isusuId]);

  if (loading) return <p className="text-gray-500">Loading members...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (members.length === 0) return <p className="text-gray-500">No members found.</p>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">👥 Members</h2>
      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.id} className="p-2 border-b">
            <Link
              href={{ pathname: "/dashboard/user-profile/user-details", query: { userId: member.id } }}
              className="block"
            >
              <p className="font-medium text-blue-600 hover:underline">{member.name}</p>
              <p className="text-gray-500 text-sm">{member.email}</p>
            </Link>

          </li>
        ))}
      </ul>
    </div>
  );
};

export default MembersList;
