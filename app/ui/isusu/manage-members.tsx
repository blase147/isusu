'use client';

import { useState, useEffect } from 'react';
import { UserIcon, ShieldCheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface Member {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
}

export default function ManageMembers({ isusuId }: { isusuId: string }) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(`/api/isusu/members-list?isusuId=${isusuId}`);
                if (!res.ok) throw new Error('Failed to fetch members');

                const data = await res.json();
                console.log("Fetched members data:", data); // Debugging

                if (!data.members || !Array.isArray(data.members)) {
                    throw new Error("Invalid response format");
                }

                setMembers(data.members); // ✅ Correct: Set only the 'members' array
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };


        fetchMembers();
    }, [isusuId]);

    const toggleAdmin = async (memberId: string) => {
        try {
            const res = await fetch(`/api/isusu/toggle-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId, isusuId }),
            });

            // 🔍 Check if response is empty
            const text = await res.text();
            console.log("Raw response text:", text);

            if (!text) throw new Error("Empty response from server");

            const data = JSON.parse(text); // Convert text to JSON manually
            console.log("Parsed JSON:", data);

            if (!res.ok) throw new Error(data.error || 'Failed to update admin status');

            setMembers((prev) =>
                prev.map((member) =>
                    member.id === memberId ? { ...member, isAdmin: !member.isAdmin } : member
                )
            );
        } catch (err) {
            console.error("Error toggling admin:", err);
            setError((err as Error).message);
        }
    };



    if (loading) return <p>Loading members...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Manage Members</h2>

            <ul className="space-y-3">
                {members.map((member) => (
                    <li
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <UserIcon className="w-6 h-6 text-gray-500" />
                            <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-600">{member.email}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleAdmin(member.id)}
                            className={clsx(
                                'flex items-center gap-2 px-3 py-1 rounded-lg text-white transition',
                                member.isAdmin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                            )}
                        >
                            {member.isAdmin ? (
                                <>
                                    <XCircleIcon className="w-5 h-5" /> Remove Admin
                                </>
                            ) : (
                                <>
                                    <ShieldCheckIcon className="w-5 h-5" /> Make Admin
                                </>
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
