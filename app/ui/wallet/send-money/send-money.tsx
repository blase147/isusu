"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SendMoney() {
  const router = useRouter();

  const [recipientType, setRecipientType] = useState<"user" | "group">("user");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState<{ id: string; isusuName: string }[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/isusu/fetch`);
        if (!response.ok) throw new Error("Failed to fetch groups");

        const data = await response.json();
        setGroups([...data.created, ...data.joined]);
      } catch {
        setError("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleSendMoney = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!amount || isNaN(+amount) || +amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (recipientType === "user" && !recipientEmail.trim()) {
      alert("Please enter the recipient's email.");
      return;
    }

    if (recipientType === "group" && !selectedGroup) {
      alert("Please select a group.");
      return;
    }

    setLoading(true);

    const payload: { amount: number; recipientEmail?: string; groupId?: string } = { amount: +amount };

    if (recipientType === "user") {
      payload.recipientEmail = recipientEmail;
    } else {
      payload.groupId = selectedGroup;
    }

    try {
      const response = await fetch("/api/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `₦${amount} successfully sent to ${
            recipientType === "user" ? recipientEmail : `group ${selectedGroup}`
          }`
        );
        router.push("/dashboard/transactions");
      } else {
        setError(result.message || "Transaction failed.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSendMoney} className="space-y-4">
          <div>
            <label htmlFor="recipientType" className="block text-gray-700">
              Send To
            </label>
            <select
              id="recipientType"
              title="Recipient Type"
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value as "user" | "group")}
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
            >
              <option value="user">User (via Email)</option>
              <option value="group">Group (Isusu)</option>
            </select>
          </div>

          {recipientType === "user" && (
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
            </div>
          )}

          {recipientType === "group" && (
            <div>
              <label className="block text-gray-700">Select Group</label>
              <select
                title="Select Group"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
                required
              >
                <option value="">-- Select Group --</option>
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.isusuName}
                    </option>
                  ))
                ) : (
                  <option disabled>No groups available</option>
                )}
              </select>
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            {loading ? "Sending..." : "Send Money"}
          </button>
        </form>
      </div>
    </div>
  );
}
