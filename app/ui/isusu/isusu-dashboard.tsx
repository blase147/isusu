"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../button";
import Link from "next/link";
import Leaderboard from "./leaderboard";
import TransactionTimeline from "./transaction-timeline";
import MembersList from "./members-list";
import Posts from "./posts"; // Import the posts component
import DuesHistory from "./dues-history"; // Import the modal
import CreatePost from "./create-post";
import MakeDonation from "./make-donation"; // Import the donation modal

const IsusuDashboard = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? ""; // Ensuring id is always a string

  const [isusuName, setIsusuName] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDuesHistory, setShowDuesHistory] = useState(false); // Modal state
  const [showMakeDonation, setShowMakeDonation] = useState(false); // Donation modal state

  useEffect(() => {
    if (!id) {
      setError("Isusu ID is missing");
      return;
    }

    const fetchIsusuName = async () => {
      try {
        console.log("Fetching Isusu with ID:", id);
        const response = await fetch(`/api/isusu/fetch?isusuId=${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch Isusu group");
        }

        const data = await response.json();
        console.log("API response data:", data);

        const isusu =
          data.created?.find((group: { id: string }) => group.id === id) ||
          data.joined?.find((group: { id: string }) => group.id === id);

        if (isusu) {
          setIsusuName(isusu.isusuName);
        } else {
          setError("Isusu group not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };

    const fetchWalletBalance = async () => {
      try {
        console.log("Fetching wallet balance for Isusu ID:", id);
        const response = await fetch(`/api/wallet/group-balance?isusuId=${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch wallet balance");
        }

        const data = await response.json();
        console.log("Wallet API response:", data);

        setWalletBalance(data.balance || 0); // Default to 0 if balance is missing
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load wallet balance");
      }
    };

    fetchIsusuName();
    fetchWalletBalance();
  }, [id]);

  return (
    <div className="container mx-auto p-6 space-y-6 text-black-900">
      {/* Top Header with Isusu Name and Wallet Balance */}
      <div className="space-x-4 flex flex-row items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">📊 {isusuName}</h2>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold">Group Wallet</h2>
          {walletBalance !== null ? (
            <p className="text-xl font-bold">N{walletBalance.toLocaleString()}</p>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>
        {error && <p className="text-red-500 font-semibold">{error}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full bg-gray-100 p-4 rounded-lg flex-wrap">
        <Button
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
          onClick={() => setShowMakeDonation(true)}
        >
          🎁 Make a Donation
        </Button>
        <Button
          className="bg-gray-600 text-white px-4 py-2 rounded-lg"
          onClick={() => setShowDuesHistory(true)}
        >
          📜 View Dues History
        </Button>
        <Link href={`/isusu/${id}/post`}>
          <Button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
            📝 Create Post
          </Button>
        </Link>
        <Link href={`/isusu/${id}/loan-request`}>
          <Button className="bg-red-400 text-white px-4 py-2 rounded-lg">
            💵 Request for Loan
          </Button>
        </Link>
      </div>

      {/* Render Modals */}
      {showDuesHistory && <DuesHistory isusuId={id} onClose={() => setShowDuesHistory(false)} />}
      {showMakeDonation && <MakeDonation isusuId={id} onClose={() => setShowMakeDonation(false)} />}

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-orange-100 p-4 rounded-lg">
        {/* Full-width Leaderboard */}
        <div className="lg:col-span-4">
          <Leaderboard />
        </div>

        {/* Left Pane - Members List */}
        <div className="lg:col-span-1">
          <MembersList isusuId={id} />
        </div>

        {/* Main Content: Create Post + Posts (left) & Transaction Timeline (right) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Section - Create Post & Posts */}
            <div className="md:col-span-1 space-y-6">
              <CreatePost /> {/* Ensure Create Post appears first */}
              <Posts isusuId={id} />
            </div>

            {/* Right Section - Transaction Timeline */}
            <div className="md:col-span-1">
              <TransactionTimeline />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsusuDashboard;
