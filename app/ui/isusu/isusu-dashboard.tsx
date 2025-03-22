"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../button";
import Link from "next/link";
import TransactionTimeline from "./transaction-timeline";
import MembersList from "./members-list";
import Posts from "./posts";
import DuesHistory from "./dues-history";
import Dues from "./dues";
import CreatePost from "./create-post";
import MakeDonation from "./make-donation";
import tiers from "../../lib/utils";
import { useSession } from "next-auth/react";
import AnnouncementsList from "./fetch-announcements";
import AnnouncementForm from "./announcements";

const IsusuDashboard = () => {
  const { id } = useParams();
  const isusuId = Array.isArray(id) ? id[0] : id ?? "";
  const { data: session } = useSession();

  const [isusuName, setIsusuName] = useState("");
  const [isusuTier, setIsusuTier] = useState("Unknown Tier");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showDuesHistory] = useState(false);
  const [showMakeDonation, setShowMakeDonation] = useState(false);
  const [showDues, setShowDues] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAnnouncements] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  const userId = session?.user?.id?.toString() || "";

  useEffect(() => {
    if (!isusuId) {
      setError("Isusu ID is missing");
      return;
    }

    const fetchData = async () => {
      try {
        const [isusuRes, walletRes, userRes] = await Promise.all([
          fetch(`/api/isusu/fetch?isusuId=${isusuId}`),
          fetch(`/api/wallet/group-balance?isusuId=${isusuId}`),
          fetch("/api/user"),
        ]);

        if (!isusuRes.ok) throw new Error("Failed to fetch Isusu group");
        if (!walletRes.ok) throw new Error("Failed to fetch wallet balance");
        if (!userRes.ok) throw new Error("Failed to fetch user data");

        const isusuData = await isusuRes.json();
        const walletData = await walletRes.json();
        const userData = await userRes.json(); // This is now used below

        const isusu =
          isusuData.created?.find((group: { id: string }) => group.id === isusuId) ||
          isusuData.joined?.find((group: { id: string }) => group.id === isusuId);

        if (!isusu) throw new Error("Isusu group not found");

        setIsusuName(isusu.isusuName);
        setIsusuTier(isusu.tier || "Unknown Tier");
        setWalletBalance(walletData.balance ?? 0);
        setIsAdmin(Array.isArray(isusu.admins) && isusu.admins.includes(userData.id)); // Now userData is used
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };


    fetchData();
  }, [isusuId, userId]);

  const formattedTier = `Tier ${isusuTier.replace(/\D/g, "")}`.trim();
  const currentTier = tiers?.find((tier) => tier.name === formattedTier);

  return (
    <div className="container mx-auto p-4 space-y-4 text-black-900 mt-4">
      <div className="flex flex-wrap justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">📊 {isusuName}</h2>
        <h2 className="text-3xl font-bold text-gray-800">{isusuTier}</h2>

        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          {(currentTier?.visibility?.walletBalance || isAdmin) && (
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

      <div className="flex flex-wrap justify-center gap-4 bg-gray-100 p-4 rounded-lg">
        <Button onClick={() => setShowMakeDonation(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg">
          🎁 Make a Donation
        </Button>
        <Button onClick={() => setShowDues(true)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">
          📜 Dues
        </Button>

        {currentTier?.permissions?.loanAccess && (
          <Link href={`/isusu/${isusuId}/loan-request`}>
            <Button className="bg-red-400 text-white px-4 py-2 rounded-lg">💵 Request for Loan</Button>
          </Link>
        )}

        {currentTier?.visibility?.transactions && (
          <Link href={`/isusu/${isusuId}/transactions`}>
            <Button className="bg-gray-700 text-white px-4 py-2 rounded-lg">📊 Transaction History</Button>
          </Link>
        )}

        {isAdmin && (
          <>
              <Button onClick={() => setShowAnnouncementForm(true)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">
                📢 Make Announcement
              </Button>
            <Link href={`/isusu/${isusuId}/withdraw`}>
              <Button className="bg-red-500 text-white px-4 py-2 rounded-lg">💰 Withdraw Funds</Button>
            </Link>
            <Link href={`/isusu/${isusuId}/edit`}>
              <Button className="bg-blue-500 text-white px-4 py-2 rounded-lg">✏️ Edit Group Profile</Button>
            </Link>
            <Link href={`/dashboard/manage-members/${isusuId}`}>
              <Button className="bg-indigo-500 text-white px-4 py-2 rounded-lg">🛠️ Manage Members</Button>
            </Link>
          </>
        )}
      </div>

      {showDuesHistory && <DuesHistory isusuId={isusuId} />}
      {showMakeDonation && <MakeDonation isusuId={isusuId} onClose={() => setShowMakeDonation(false)} />}
      {showDues && <Dues isusuId={isusuId} onClose={() => setShowDues(false)} />}
      {showAnnouncements && <AnnouncementsList isusuId={isusuId} />}
      {showAnnouncementForm && <AnnouncementsList isusuId={isusuId} />}
      {showAnnouncementForm && <AnnouncementForm isusuId={isusuId} onClose={() => setShowAnnouncementForm(false)} />}


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-orange-100 p-4 rounded-lg">
        <div className="lg:col-span-4"><AnnouncementsList isusuId={isusuId} /></div>
        <div className="lg:col-span-1"><MembersList isusuId={isusuId} /></div>
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <CreatePost />
              <Posts isusuId={isusuId} />
            </div>
            <div><TransactionTimeline /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsusuDashboard;
