"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const JoinIsusu = () => {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (!inviteCode.trim()) {
      setError("Please enter a valid invite code.");
      return;
    }

    // Simulating a join request (Replace with actual API call)
    console.log("Joining Isusu with code:", inviteCode);
    router.push("/dashboard/isusu"); // Redirect after joining
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
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-700"
        >
          Join Now
        </button>
      </div>
    </div>
  );
};

export default JoinIsusu;
