"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendMoney() {
  const router = useRouter();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientEmail || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Debugging logs before request
    console.log("📩 Sending Request:", { recipientEmail, amount });

    try {
      const response = await fetch("/api/wallet/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies are sent with the request
        body: JSON.stringify({
          recipientEmail, // ✅ Ensure this matches the backend variable name
          amount: parseFloat(amount), // ✅ Convert to float safely
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`₦${amount} successfully sent to ${recipientEmail}`);
        router.push("/dashboard/transactions");
      } else {
        alert(result.message || "Transaction failed.");
      }
    } catch (error) {
      console.error("🚨 Error sending money:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
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
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            {loading ? "Sending..." : "Send Money"}
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
