// components/DepositForm.js
"use client"

import { useState } from "react";

export default function DepositForm() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter a valid amount");
    setLoading(true);

    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = data.payment_url; // Redirect to Paystack
      } else {
        alert(data.error || "Deposit failed");
      }
    } catch (error) {
      console.error("Deposit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">Deposit Funds</h2>
      <input
        type="number"
        className="w-full p-2 border rounded mt-2"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={handleDeposit}
        className="w-full mt-3 bg-green-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Processing..." : "Deposit"}
      </button>
    </div>
  );
}
