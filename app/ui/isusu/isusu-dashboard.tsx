"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./../button";
import Link from "next/link";
import ActivitiesList from "./activities-list";
import Leaderboard from "./leaderboard";
import TransactionTimeline from "./transaction-timeline";
import MembersList from "./members-list";

const IsusuDashboard = () => {
  const { id } = useParams();
  const [isusuName, setIsusuName] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">📊 {isusuName}</h2>
      {error && <p className="text-red-500 font-semibold">{error}</p>}

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

        {/* Group Wallet Section */}
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold">Group Wallet</h2>
          {walletBalance !== null ? (
            <p className="text-xl font-bold">N{walletBalance.toLocaleString()}</p>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4">
          <Leaderboard />
        </div>

        <div className="lg:col-span-1">
          <MembersList isusuId={Array.isArray(id) ? id[0] : id ?? ""} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivitiesList />
            <TransactionTimeline />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsusuDashboard;
