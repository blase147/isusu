"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../button";
import Link from "next/link";
import Leaderboard from "./leaderboard";
import TransactionTimeline from "./transaction-timeline";
import MembersList from "./members-list";
import Posts from "./posts";
import DuesHistory from "./dues-history";
import CreatePost from "./create-post";
import MakeDonation from "./make-donation";
import tiers from "../../lib/utils";

const IsusuDashboard = () => {
  const { id } = useParams();
  const isusuId = Array.isArray(id) ? id[0] : id ?? "";

  const [isusuName, setIsusuName] = useState("");
  const [isusuTier, setIsusuTier] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showDuesHistory, setShowDuesHistory] = useState(false);
  const [showMakeDonation, setShowMakeDonation] = useState(false);

  useEffect(() => {
    if (!isusuId) {
      setError("Isusu ID is missing");
      return;
    }

    const fetchData = async () => {
      try {
        const [isusuRes, walletRes] = await Promise.all([
          fetch(`/api/isusu/fetch?isusuId=${isusuId}`),
          fetch(`/api/wallet/group-balance?isusuId=${isusuId}`)
        ]);

        if (!isusuRes.ok) throw new Error("Failed to fetch Isusu group");
        if (!walletRes.ok) throw new Error("Failed to fetch wallet balance");

        const isusuData = await isusuRes.json();
        const walletData = await walletRes.json();

        const isusu = isusuData.created?.find((group: { id: string }) => group.id === isusuId) ||
          isusuData.joined?.find((group: { id: string }) => group.id === isusuId);

        if (!isusu) throw new Error("Isusu group not found");

        setIsusuName(isusu.isusuName);
        setIsusuTier(isusu.tier || "Unknown Tier");

        setWalletBalance(walletData.balance || 0);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "An unknown error occurred");
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    fetchData();
  }, [isusuId]);

  const formattedTier = `Tier ${isusuTier.replace(/\D/g, "")}`.trim();
  const currentTier = tiers.find((tier) => tier.name === formattedTier);

  if (!currentTier) {
    console.warn("Warning: Tier not found for:", isusuTier);
  }
  const isAdmin = true; // Replace with actual admin check


  return (
    <div className="container mx-auto p-4 space-y-4 text-black-900 mt-4">
      <div className="flex flex-wrap justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">📊 {isusuName}</h2>
        <h2 className="text-3xl font-bold text-gray-800">{isusuTier}</h2>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">

          {(currentTier?.visibility?.walletBalance === 'Visible to all members' ||
            (currentTier?.visibility?.walletBalance === 'Visible to only Admin' && isAdmin)) && (
              <Link href={`/isusu/${isusuId}/loan-request`}>
                <h2 className="text-lg font-semibold">Group Wallet</h2>
                <p className="text-xl font-bold">
                  {walletBalance !== null ? `N${walletBalance.toLocaleString()}` : "Loading..."}
                </p>
              </Link>
            )}



        </div>
        {error && <p className="text-red-500 font-semibold">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-4 bg-gray-100 p-4 rounded-lg">
        <Button className="bg-green-600 text-white px-4 py-2 rounded-lg" onClick={() => setShowMakeDonation(true)}>
          🎁 Make a Donation
        </Button>
        <Button className="bg-gray-600 text-white px-4 py-2 rounded-lg" onClick={() => setShowDuesHistory(true)}>
          📜 View Dues History
        </Button>
        <Link href={`/isusu/${isusuId}/post`}>
          <Button className="bg-blue-600 text-white px-4 py-2 rounded-lg">📝 Create a Post</Button>
        </Link>
        {currentTier?.permissions.loanAccess && (
          <Link href={`/isusu/${isusuId}/loan-request`}>
            <Button className="bg-red-400 text-white px-4 py-2 rounded-lg">💵 Request for Loan</Button>
          </Link>
        )}
      </div>

      {showDuesHistory && <DuesHistory isusuId={isusuId} onClose={() => setShowDuesHistory(false)} />}
      {showMakeDonation && <MakeDonation isusuId={isusuId} onClose={() => setShowMakeDonation(false)} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-orange-100 p-4 rounded-lg">
        <div className="lg:col-span-4">
          <Leaderboard />
        </div>
        <div className="lg:col-span-1">
          <MembersList isusuId={isusuId} />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <CreatePost />
              <Posts isusuId={isusuId} />
            </div>
            <div>
              <TransactionTimeline />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsusuDashboard;
