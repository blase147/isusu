"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./../button"; // Fixed import
import Link from "next/link";

interface IsusuGroup {
  id: string;
  name: string;
}

export default function IsusuDashboard() {
  const { id } = useParams();
  console.log("📌 Retrieved isusuId from params:", id);

  const [joinedIsusus, setJoinedIsusus] = useState<IsusuGroup[]>([]);
  interface Member {
    id: string;
    name: string;
    email: string;
  }

  const [members, setMembers] = useState<Member[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState({
    members: true,
    leaderboard: true,
    activities: true,
    transactions: true,
  });
  const [error, setError] = useState<string | null>(null);

  const isusuName =
    joinedIsusus.find((group) => group.id === id)?.name || "Isusu Dashboard";

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setError(null);

        const [
          isusuGroupsRes,
          membersRes,
          leaderboardRes,
          activitiesRes,
          transactionsRes,
        ] = await Promise.all([
          fetch("/api/isusu/joined"),
          fetch(`/api/isusu/members?isusuId=${id}`),
          fetch(`/api/isusu/leaderboard?isusuId=${id}`),
          fetch(`/api/isusu/activities?isusuId=${id}`),
          fetch(`/api/isusu/transactions?isusuId=${id}`),
        ]);

        if (
          !isusuGroupsRes.ok ||
          !membersRes.ok ||
          !leaderboardRes.ok ||
          !activitiesRes.ok ||
          !transactionsRes.ok
        ) {
          throw new Error("Failed to load data");
        }

        const isusuGroups = await isusuGroupsRes.json();
        const membersData = await membersRes.json();
        const leaderboardData = await leaderboardRes.json();
        const activitiesData = await activitiesRes.json();
        const transactionsData = await transactionsRes.json();

        console.log("✅ Members Data:", membersData);
        console.log("🏆 Leaderboard Data:", leaderboardData);
        console.log("💰 Transactions Data:", transactionsData);

        setJoinedIsusus(isusuGroups);
        setMembers(membersData || []);
        setLeaderboard(leaderboardData || []);
        setActivities(activitiesData || []);
        setTransactions(transactionsData || []);

        setLoading({
          members: false,
          leaderboard: false,
          activities: false,
          transactions: false,
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">📊 {isusuName}</h2>
      {error && <p className="text-red-500 font-semibold">{error}</p>}

      {/* Action Buttons */}
      <div className="flex gap-4">
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
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-4">
          {/* Leaderboard - Full Width */}
          <Leaderboard data={leaderboard} loading={loading.leaderboard} />
          </div>

        {/* Left Pane - Members List */}
        <div className="lg:col-span-1">
          <MembersList data={members} loading={loading.members} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group Activities - Center */}
            <ActivitiesList data={activities} loading={loading.activities} />

            {/* Right Pane - Transaction Timeline */}
            <TransactionTimeline
              data={transactions}
              loading={loading.transactions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Members List Component
const MembersList = ({
  data,
  loading,
}: {
  data: { id: string; name: string; email: string }[];
  loading: boolean;
}) => (
  <div className="bg-white shadow rounded-lg p-4">
    <h3 className="text-lg font-semibold">👥 Members</h3>
    {loading ? (
      <p>Loading...</p>
    ) : data.length ? (
      data.map((member) => (
        <div key={member.id} className="flex justify-between border-b py-2">
          <span>{member.name}</span>{" "}
          <span className="text-gray-400">{member.email}</span>
        </div>
      ))
    ) : (
      <p className="text-gray-400">No members found.</p>
    )}
  </div>
);

// Leaderboard Component
interface LeaderboardData {
  id: string;
  name: string;
  score: number;
}

const Leaderboard = ({
  data,
  loading,
}: {
  data: LeaderboardData[];
  loading: boolean;
}) => (
  <div className="bg-yellow-100 shadow rounded-lg p-4">
    <h3 className="text-lg font-semibold">🏆 Leaderboard</h3>
    {loading ? (
      <p>Loading...</p>
    ) : data.length ? (
      data.map((item) => (
        <div key={item.id} className="flex justify-between border-b py-2">
          <span>{item.name}</span>{" "}
          <span className="text-gray-400">{item.score}</span>
        </div>
      ))
    ) : (
      <p className="text-gray-400">No leaderboard data found.</p>
    )}
  </div>
);

interface ActivityData {
  id: string;
  description: string;
  date: string;
}

const ActivitiesList = ({
  data,
  loading,
}: {
  data: ActivityData[];
  loading: boolean;
}) => (
  <div className="bg-blue-100 shadow rounded-lg p-4">
    <h3 className="text-lg font-semibold">📅 Activities</h3>
    {loading ? (
      <p>Loading...</p>
    ) : data.length ? (
      data.map((activity) => (
        <div key={activity.id} className="flex justify-between border-b py-2">
          <span>{activity.description}</span>{" "}
          <span className="text-gray-400">{activity.date}</span>
        </div>
      ))
    ) : (
      <p className="text-gray-400">No activities found.</p>
    )}
  </div>
);

interface TransactionData {
  id: string;
  amount: number;
  date: string;
}

const TransactionTimeline = ({
  data,
  loading,
}: {
  data: TransactionData[];
  loading: boolean;
}) => (
  <div className="bg-green-100 shadow rounded-lg p-4">
    <h3 className="text-lg font-semibold">💰 Transaction Timeline</h3>
    {loading ? (
      <p>Loading...</p>
    ) : data.length ? (
      data.map((transaction) => (
        <div key={transaction.id} className="flex justify-between border-b py-2">
          <span>{transaction.amount}</span>{" "}
          <span className="text-gray-400">{transaction.date}</span>
        </div>
      ))
    ) : (
      <p className="text-gray-400">No transactions found.</p>
    )}
  </div>
);

// Transaction Timeline Component
