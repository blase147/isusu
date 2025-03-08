// components/WithdrawForm.js

"use client"

import { useState } from "react";
import { useWalletStore } from "../../../lib/store/wallet";

interface WalletStore {
  balance: number;
  updateBalance: (newBalance: number) => void;
}

  const WithdrawForm = () => {
    const { balance, updateBalance } = useWalletStore() as WalletStore;
    const [amount, setAmount] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter a valid amount");
    if (parseFloat(amount) > balance) return alert("Insufficient balance");

    setLoading(true);

    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), bankCode, accountNumber }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Withdrawal successful!");
        updateBalance(balance - parseFloat(amount));
      } else {
        alert(data.error || "Withdrawal failed");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">Withdraw Funds</h2>
      <input
        type="number"
        className="w-full p-2 border rounded mt-2"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        className="w-full p-2 border rounded mt-2"
        placeholder="Bank Code"
        value={bankCode}
        onChange={(e) => setBankCode(e.target.value)}
      />
      <input
        type="text"
        className="w-full p-2 border rounded mt-2"
        placeholder="Account Number"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
      />
      <button
        onClick={handleWithdraw}
        className="w-full mt-3 bg-blue-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Processing..." : "Withdraw"}
      </button>
    </div>
  );
};

export default WithdrawForm;
