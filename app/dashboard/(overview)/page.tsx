'use client';

import { useState } from 'react';
import {
  FaWallet, FaExchangeAlt, FaMoneyCheckAlt, FaThumbsUp,
  FaComment, FaShare
} from 'react-icons/fa';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5">
      {isOpen ? (
        <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 w-80">
          <div className="flex justify-between mb-3">
            <h3 className="text-xl font-semibold">💬 Chat</h3>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>
          <textarea className="w-full p-3 border rounded-md" placeholder="Type your message..."></textarea>
          <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            Send
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          💬
        </button>
      )}
    </div>
  );
};

const IsusuInfo = () => (
  <div className="bg-white p-4 rounded shadow">
    <h2 className="text-xl font-semibold">Welcome to Your Isusu Dashboard!</h2>
    <p>Congratulations on signing up and joining Isusu! Here’s everything you need to know:</p>

    <h3 className="font-semibold mt-4">Your Obligations & Responsibilities</h3>
    <ul className="list-disc pl-5">
      <li>✅ Follow the group&apos;s policies.</li>
      <li>✅ Pay your dues on time.</li>
      <li>✅ Honor your financial commitments.</li>
    </ul>

    <p className="mt-2">
      Some groups automatically bill members based on settings chosen by the owner.
      Be sure to check the group&apos;s payment policy before consenting to join.
    </p>

    <h3 className="font-semibold mt-4">What You Can Do</h3>
    <ul className="list-disc pl-5">
      <li>🔹 <strong>Create an Isusu Group</strong> – ₦1,000 per group. Groups last forever unless deleted by the owner. **Cannot be deleted while an Isusu cycle is ongoing**.</li>
      <li>🔹 <strong>Join Multiple Isusu Groups</strong> – Join and create multiple Isusu cycles.</li>
      <li>🔹 <strong>Make Donations</strong> – Support other members by making voluntary contributions.</li>
      <li>🔹 <strong>Track Your Payments & Earnings</strong> – Stay updated on transactions, contributions, and upcoming payments.</li>
    </ul>

    <h3 className="font-semibold mt-4">Important Reminders</h3>
    <p>💡 Once you join a group, you must meet all financial obligations.</p>
    <p>💡 Some groups have **automated billing**, meaning payments are deducted on a set schedule. **Check before joining!**</p>

    <p className="mt-4 font-bold">Enjoy financial growth and collaboration with Isusu! 🚀</p>
  </div>
);

const Page = () => {
  const [activities] = useState([
    { id: 1, user: 'John Doe', action: 'made a withdrawal', amount: '$500', time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', action: 'deposited funds', amount: '$1,200', time: '5 hours ago' },
    { id: 3, user: 'Michael Lee', action: 'transferred money', amount: '$200', time: '1 day ago' },
  ]);

  const insights = {
    totalSavings: '$10,000',
    totalTransactions: 24,
    upcomingPayments: 2,
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-blue-black">
      {/* Left Sidebar */}
      <aside className="w-1/5 bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <ul className="space-y-3">
          <li className="flex items-center space-x-2 cursor-pointer hover:text-blue-500">
            <FaWallet /> <span>Wallet</span>
          </li>
          <li className="flex items-center space-x-2 cursor-pointer hover:text-blue-500">
            <FaExchangeAlt /> <span>Transactions</span>
          </li>
          <li className="flex items-center space-x-2 cursor-pointer hover:text-blue-500">
            <FaMoneyCheckAlt /> <span>Withdrawals</span>
          </li>
        </ul>
      </aside>

      {/* Main Timeline */}
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-4">Activity Timeline</h2>

        {/* Isusu Information */}
        <IsusuInfo />

        <div className="space-y-4 mt-6">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white p-4 rounded shadow">
              <p>
                <strong>{activity.user}</strong> {activity.action}
                <span className="text-blue-500"> {activity.amount}</span>
              </p>
              <small className="text-gray-500">{activity.time}</small>
              <div className="mt-2 flex space-x-4 text-gray-600">
                <FaThumbsUp className="cursor-pointer hover:text-blue-500" />
                <FaComment className="cursor-pointer hover:text-blue-500" />
                <FaShare className="cursor-pointer hover:text-blue-500" />
              </div>
            </div>
          ))}
        </div>

        {/* ChatBox Component */}
        <ChatBox />
      </main>

      {/* Right Sidebar */}
      <aside className="w-1/5 bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Insights</h2>
        <div className="space-y-3">
          <div className="bg-gray-100 p-3 rounded">
            <h3 className="text-lg font-semibold">Total Savings</h3>
            <p className="text-xl font-bold">{insights.totalSavings}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <h3 className="text-lg font-semibold">Total Transactions</h3>
            <p className="text-xl font-bold">{insights.totalTransactions}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <h3 className="text-lg font-semibold">Upcoming Payments</h3>
            <p className="text-xl font-bold">{insights.upcomingPayments}</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Page;
