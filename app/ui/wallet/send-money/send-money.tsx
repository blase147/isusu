"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendMoney() {
  const router = useRouter();

  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch recipient details
  const handleFetchRecipient = async () => {
    if (!recipientEmail.trim()) {
      setError("Please enter the recipient's email.");
      return;
    }

    setError(null);
    setRecipientName(null);
    setRecipientPhone(""); // Clear previous phone state
    setVerifying(true);

    try {
      const response = await fetch(`/api/user?email=${recipientEmail}`);

      if (!response.ok) {
        throw new Error("Recipient not found.");
      }

      const data = await response.json();
      setRecipientName(data.name || "Unknown Recipient");
      setRecipientPhone(data.phone || ""); // ✅ Correctly set phone number

    } catch {
      setError("Failed to fetch recipient details.");
    } finally {
      setVerifying(false);
    }
  };


  // ✅ Handle money transfer
  const handleSendMoney = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!amount || isNaN(+amount) || +amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!recipientEmail.trim() || !recipientPhone.trim()) {
      alert("Please enter both email and phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: +amount,
          recipientEmail,
          recipientPhone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Transaction failed.");
      }

      alert(`₦${amount} successfully sent to ${recipientName || recipientEmail}`);
      router.push("/dashboard/transactions");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSendMoney} className="space-y-4">
          {/* Recipient Email */}
          <div>
            <label className="block text-gray-700">Recipient Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Enter recipient email"
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              required
            />
            <button
              type="button"
              onClick={handleFetchRecipient}
              className="mt-2 bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600"
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Verify Email"}
            </button>
          </div>

          {/* Display Recipient Name */}
          {recipientName && (
            <p className="text-green-600">Recipient: {recipientName}</p>
          )}

          {/* Recipient Phone */}
          <div>
            <label className="block text-gray-700">Confirm Phone Number</label>
            <input
              type="tel"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="Enter recipient phone number"
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-700">Amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !recipientName}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            {loading ? "Sending..." : "Send Money"}
          </button>
        </form>
      </div>
    </div>
  );
}
