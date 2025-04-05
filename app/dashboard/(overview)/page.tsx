'use client';

import { useState } from 'react';
import {
  FaWallet, FaExchangeAlt, FaMoneyCheckAlt, FaThumbsUp,
  FaComment, FaShare, FaBars, FaTimes
} from 'react-icons/fa';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 md:right-10">
      {isOpen ? (
        <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 w-72 md:w-96">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-semibold">💬 Chat</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500">
              ✖
            </button>
          </div>
          <textarea className="w-full p-3 border rounded-md" placeholder="Type your message..."></textarea>
          <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            Send
          </button>
        </div>
      ) : (
        <button
          type='button'
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
    <h2 className="text-lg md:text-xl font-semibold">Welcome to Your Isusu App!</h2>
    <p className="text-sm md:text-base">Congratulations on signing up! Here’s everything you need to know:</p>

    <h3 className="font-semibold mt-4">Your Obligations & Responsibilities</h3>
    <ul className="list-disc pl-5 text-sm">
      <li>✅ Follow the group&apos;s policies.</li>
      <li>✅ Pay your dues on time.</li>
      <li>✅ Honor your financial commitments.</li>
    </ul>

    <p className="mt-2 text-sm">
      Some groups automatically bill members based on settings chosen by the owner.
      Be sure to check the group&apos;s payment policy before consenting to join.
    </p>

    <h3 className="font-semibold mt-4">What You Can Do</h3>
    <ul className="list-disc pl-5 text-sm">
      <li>🔹 <strong>Create an Isusu Group</strong> – ₦1,000 per group.</li>
      <li>🔹 <strong>Join Multiple Isusu Groups</strong> – Join and create multiple cycles.</li>
      <li>🔹 <strong>Make Donations</strong> – Support other members.</li>
      <li>🔹 <strong>Track Your Payments & Earnings</strong> – Stay updated.</li>
    </ul>

    <h3 className="font-semibold mt-4">Important Reminders</h3>
    <p className="text-sm">💡 Once you join a group, you must meet all financial obligations.</p>
    <p className="text-sm">💡 Some groups have **automated billing**—check before joining!</p>

    <p className="mt-4 font-bold text-sm md:text-base">Enjoy financial growth with Isusu! 🚀</p>
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

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 text-gray-900">
      {/* Mobile Menu */}
      <button
        type='button'
        aria-label="Toggle Menu"
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden p-4 fixed top-2 left-2 bg-blue-600 text-white rounded-full shadow-md"
      >
        {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Left Sidebar */}
      <aside className={`md:w-1/5 bg-white p-6 shadow-md absolute md:relative w-3/4 h-full transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <h2 className="text-lg md:text-xl font-semibold mb-4">Quick Actions</h2>
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

      {/* Main Content */}
      <main className="flex-1 p-6">

        <IsusuInfo />

        <div className="space-y-4 mt-6">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white p-4 rounded shadow">
              <p className="text-sm md:text-base">
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

        <ChatBox />
      </main>

      {/* Right Sidebar */}
      <aside className="w-full md:w-1/5 bg-white p-6 shadow-md mt-6 md:mt-0">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Insights</h2>
        <div className="space-y-3">
          <div className="bg-gray-100 p-3 rounded">
            <h3 className="text-sm md:text-lg font-semibold">Total Savings</h3>
            <p className="text-lg md:text-xl font-bold">{insights.totalSavings}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <h3 className="text-sm md:text-lg font-semibold">Total Transactions</h3>
            <p className="text-lg md:text-xl font-bold">{insights.totalTransactions}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <h3 className="text-sm md:text-lg font-semibold">Upcoming Payments</h3>
            <p className="text-lg md:text-xl font-bold">{insights.upcomingPayments}</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Page;
