"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../button";
import Image from "next/image";
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
  const [activeTab, setActiveTab] = useState("posts");
  const [showTransactions, setShowTransactions] = useState(false);

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
    <div className="container mx-auto p-4 space-y-6 text-black-900 mt-6">
      {/* 📊 Isusu Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div>
          <Image
            src="/images/group-placeholder.jpg"
            alt="Group Image"
            width={128} // Adjust width as needed
            height={128} // Adjust height as needed
            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-md"
          />
        </div>
        <div className="md:col-span-6">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">{isusuName}</h1>
          <p className="text-lg text-gray-600">{isusuTier}</p>
        </div>
        <div className="md:col-span-4 bg-white shadow-lg p-4 rounded-xl text-center">
          <h2 className="text-lg md:text-xl font-semibold text-gray-700">Group Wallet</h2>
          <p className="text-xl md:text-2xl font-bold text-green-700">
            {walletBalance !== null ? `N${walletBalance.toLocaleString()}` : "Loading..."}
          </p>
          {error && <p className="text-red-500 font-semibold">{error}</p>}
        </div>
      </div>



      <div className="flex flex-wrap justify-center gap-4 bg-gray-100 p-4 rounded-lg">
        <Button onClick={() => setShowMakeDonation(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg">
          🎁 Donate
        </Button>
        <Button onClick={() => setShowDues(true)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">
          📜 Dues
        </Button>

        {currentTier?.permissions?.loanAccess && (
          <Link href={`/isusu/${isusuId}/loan-request`}>
            <Button className="bg-red-400 text-white px-4 py-2 rounded-lg">💵 Loan Request</Button>
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
                📢 Announce
              </Button>
            <Link href={`/isusu/${isusuId}/withdraw`}>
              <Button className="bg-red-500 text-white px-4 py-2 rounded-lg">💰 Withdraw</Button>
            </Link>
            <Link href={`/dashboard/update-isusu/${isusuId}`}>
              <Button className="bg-blue-500 text-white px-4 py-2 rounded-lg">✏️ Edit Group</Button>
            </Link>
            <Link href={`/dashboard/manage-members/${isusuId}`}>
              <Button className="bg-indigo-500 text-white px-4 py-2 rounded-lg">🛠️ Manage Members</Button>
            </Link>
          </>
        )}
      </div>

      <div>
        {showDuesHistory && <DuesHistory isusuId={isusuId} />}
        {showMakeDonation && <MakeDonation isusuId={isusuId} onClose={() => setShowMakeDonation(false)} />}
        {showDues && <Dues isusuId={isusuId} onClose={() => setShowDues(false)} />}
        {showAnnouncements && <AnnouncementsList isusuId={isusuId} />}
        {showAnnouncementForm && <AnnouncementsList isusuId={isusuId} />}
        {showAnnouncementForm && <AnnouncementForm isusuId={isusuId} onClose={() => setShowAnnouncementForm(false)} />}
      </div>


      {/* 📜 Main Content (Posts, Dues, Members) */}
            {/* 📜 Main Content (Posts, Dues, Members) */}
            <div className="flex flex-col-reverse md:grid md:grid-cols-12 gap-6">

              {/* 📢 Announcements */}
              <div className="md:col-span-12 bg-yellow-100 p-4 rounded-lg">
                <AnnouncementsList isusuId={isusuId} />
              </div>

              {/* 📜 Tabs for Posts, Dues & Members */}
              <div className="md:col-span-9 space-y-6">
                <div className="flex overflow-x-auto space-x-2 md:space-x-4 border-b pb-2">
                  <button
                    className={`px-3 py-1 md:px-4 md:py-2 font-semibold ${activeTab === "posts" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-600"}`}
                    onClick={() => setActiveTab("posts")}
                  >
                    📝 Posts
                  </button>
                  <button
                    className={`px-3 py-1 md:px-4 md:py-2 font-semibold ${activeTab === "dues" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-600"}`}
                    onClick={() => setActiveTab("dues")}
                  >
                    💰 Dues
                  </button>
                  <button
                    className={`px-3 py-1 md:px-4 md:py-2 font-semibold ${activeTab === "members" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-600"}`}
                    onClick={() => setActiveTab("members")}
                  >
                    👥 Members
                  </button>
                </div>

                {activeTab === "posts" && (
            <div className="md:col-span-9  space-y-4 bg-white p-4 rounded-lg shadow-md">
                    <CreatePost />
                    <Posts isusuId={isusuId} />
                  </div>
                )}
                {activeTab === "dues" && <DuesHistory isusuId={isusuId} />}
                {activeTab === "members" && <MembersList isusuId={isusuId} />}
              </div>

              {/* 💳 Collapsible Transactions */}
              <button onClick={() => setShowTransactions(!showTransactions)} className="md:hidden text-blue-600 underline">
                {showTransactions ? "Hide Transactions" : "Show Transactions"}
              </button>
              {showTransactions && <TransactionTimeline />}
              <div className="hidden md:block md:col-span-3">
                <TransactionTimeline />
              </div>
            </div>

    </div>
  );
};

export default IsusuDashboard;
