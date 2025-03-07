"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const JoinIsusu = () => {
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
    setError(""); // Clear previous errors
    if (!inviteCode.trim()) {
      setError("Please enter a valid invite code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/isusu/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }), // ✅ Match backend `inviteCode` key
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "already_member") {
          setError("You are already a member of this group.");
        } else if (data.error === "owner") {
          setError("You own this group and cannot join as a member.");
        } else if (data.error === "Group not found") {
          setError("Invalid invite code. Please check and try again.");
        } else {
          setError(data.error || "Failed to join group.");
        }
        return;
      }

      // ✅ Redirect on success
      router.push("/dashboard/isusu/join");
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
          className={`w-full text-white px-4 py-2 rounded-lg mt-4 ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Joining..." : "Join Now"}
        </button>
      </div>
    </div>
  );
};

export default JoinIsusu;
