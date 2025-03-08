"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendMoney() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");

  const handleSendMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    // Simulate sending money (Replace with API call)
    alert(`₦${amount} sent to ${email}`);
    router.push("/dashboard/transactions"); // Redirect to Transactions page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Send Money</h2>

        <form onSubmit={handleSendMoney} className="space-y-4">
          <div>
            <label className="block text-gray-700">Recipient Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter recipient email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            Send Money
          </button>
        </form>

        {/* Back to Transactions Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/dashboard/transactions")}
            className="text-blue-600 hover:underline"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
