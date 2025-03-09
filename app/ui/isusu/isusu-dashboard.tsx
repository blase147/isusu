"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./../button"; // Fixed import
import Link from "next/link";
import ActivitiesList from "./activities-list";
import Leaderboard from "./leaderboard";
import TransactionTimeline from "./transaction-timeline";
import MembersList from "./members-list";

const IsusuDashboard = () => {
  const { id } = useParams(); // Extract id from URL
  const [isusuName, setIsusuName] = useState("Isusu Group"); // Example default name
  const [error, setError] = useState<string | null>(null); // State to handle errors

  useEffect(() => {
    // Fetch group name or any other relevant data
    // Example fetch (Replace with actual API call if needed)
    const fetchGroupData = async () => {
      try {
        // Simulate an API request
        const response = await fetch(`/api/isusu/fetch${id}`);
        if (!response.ok) throw new Error("Failed to fetch group details");
        const data = await response.json();
        setIsusuName(data.name);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    if (id) {
      fetchGroupData();
    }
  }, [id]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">📊 {isusuName}</h2>
      {error && <p className="text-red-500 font-semibold">{error}</p>}

      {/* Action Buttons */}
      <div className="flex gap-4 w-full justify-between bg-gray-100 p-4 rounded-lg flex-wrap">
        <Link href={`/isusu/${id}/pay-dues`}>
          <Button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            💳 Pay Dues
          </Button>
        </Link>
        <Link href={`/isusu/${id}/donate`}>
          <Button className="bg-green-600 text-white px-4 py-2 rounded-lg">
            🎁 Make a Donation
          </Button>
        </Link>
        <Link href={`/isusu/${id}/dues-history`}>
          <Button className="bg-gray-600 text-white px-4 py-2 rounded-lg">
            📜 View Dues History
          </Button>
        </Link>
        <Link href={`/isusu/${id}/post`}>
          <Button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
            📝 Create Post
          </Button>
        </Link>
        <Link href={`/isusu/${id}/loan-request`}>
          <Button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
            💵 Request for Loan
          </Button>
        </Link>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold">Group Wallet</h2>
          <p className="text-xl font-bold">N4,000,000</p>
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4">
          {/* Leaderboard - Full Width */}
          <Leaderboard />
        </div>

        {/* Left Pane - Members List */}
        <div className="lg:col-span-1">
          <MembersList isusuId={Array.isArray(id) ? id[0] : id ?? ''} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group Activities - Center */}
            <ActivitiesList />

            {/* Right Pane - Transaction Timeline */}
            <TransactionTimeline />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsusuDashboard;
