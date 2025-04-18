"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const JoinIsusuContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Extract inviteCode from URL if present
  useEffect(() => {
    const codeFromURL = searchParams.get("invite_code");
    if (codeFromURL) {
      setInviteCode(codeFromURL);
    }
  }, [searchParams]);

  const handleJoin = async () => {
    setError("");
    if (!inviteCode.trim()) {
      setError("Please enter a valid invite code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/isusu/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join group.");
        return;
      }

      console.log("Redirecting to:", `/dashboard/isusu/isusu-dashboard/${data.groupId}`); // ✅ Debugging
      router.push(`/dashboard/isusu-dashboard/${data.groupId}`); // ✅ Navigate to group page

    } catch (err) {
      console.error("Join error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Join Isusu</h2>
        <p className="text-gray-600 text-center mb-4">
          Enter your invite code to join an Isusu group.
        </p>
        <input
          type="text"
          placeholder="Enter invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        <button
          onClick={handleJoin}
          className={`w-full text-white px-4 py-2 rounded-lg mt-4 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          disabled={loading}
        >
          {loading ? "Joining..." : "Join Now"}
        </button>
      </div>
    </div>
  );
};

// ✅ Wrap in Suspense boundary
const JoinIsusu = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <JoinIsusuContent />
  </Suspense>
);

export default JoinIsusu;
