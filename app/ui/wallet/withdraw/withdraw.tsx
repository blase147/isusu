"use client";
import { useEffect, useState } from "react";

export default function Withdraw() {
  interface Bank {
    id: string;
    code: string;
    name: string;
  }

  const [banks, setBanks] = useState<Bank[]>([]);
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState(""); // Store bank name
  const [accountNumber, setAccountNumber] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  async function fetchWalletBalance() {
    try {
      const response = await fetch("/api/wallet/balance");
      const data = await response.json();
      if (data.success) {
        setWalletBalance(data.balance);
      } else {
        console.error("Error fetching balance:", data.message);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }

  useEffect(() => {
    async function fetchBanks() {
      try {
        const response = await fetch("/api/wallet/banks");
        const data = await response.json();
        if (data.success) {
          setBanks(data.banks);
        } else {
          console.error("Error fetching banks:", data.message);
        }
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    }

    fetchBanks();
    fetchWalletBalance();
  }, []);

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    setBankCode(selectedCode);

    const selectedBank = banks.find((bank) => bank.code === selectedCode);
    setBankName(selectedBank ? selectedBank.name : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankCode || !bankName) {
      alert("Please select a valid bank");
      return;
    }

    const payload = {
      amount,
      bankName,
      bankCode,
      accountNumber,
    };

    console.log("Submitting:", payload);

    const response = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.success) {
      alert("Withdrawal successful!");
      fetchWalletBalance(); // Update balance after withdrawal
    } else {
      alert(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>

      {/* Wallet Balance */}
      <div className="mb-4 text-gray-700 font-semibold">
        Wallet Balance: {walletBalance !== null ? `₦${walletBalance}` : "Loading..."}
      </div>

      {/* Amount Input */}
      <label className="block mb-2">
        Amount:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="block w-full p-2 border rounded mt-1"
        />
      </label>

      {/* Bank Selection Dropdown */}
      <label className="block mb-2">
        Select Bank:
        <select
          value={bankCode}
          onChange={handleBankChange}
          required
          className="block w-full p-2 border rounded mt-1"
        >
          <option value="">Choose a bank</option>
          {banks.map((bank) => (
            <option key={bank.id} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
      </label>

      {/* Account Number Input */}
      <label className="block mb-2">
        Account Number:
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
          className="block w-full p-2 border rounded mt-1"
        />
      </label>

      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4">
        Withdraw
      </button>
    </form>
  );
}
