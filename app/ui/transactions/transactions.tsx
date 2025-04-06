"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Transactions() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/wallet/balance", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch balance");
        }

        const data = await response.json();
        setBalance(data.balance); // Assuming API returns { balance: number }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Wallet</h2>

        {/* Display Balance */}
        <div className="text-center mb-6">
          <p className="text-gray-600">Available Balance</p>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <h1 className="text-3xl font-semibold text-green-600">
              ₦{balance?.toFixed(2)}
            </h1>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            onClick={() => router.push("/dashboard/transactions/deposit")}
          >
            Deposit
          </button>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            onClick={() => router.push("/dashboard/transactions/withdraw")}
          >
            Withdraw
          </button>
          <button
            type="button"
            className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 col-span-2"
            onClick={() => router.push("/dashboard/transactions/send-money")}
          >
            Send Money
          </button>
        </div>

        {/* Transaction History Button */}
        <div className="mt-6 text-center">
          <a href="/dashboard/transactions/transaction-history" className="text-blue-600 hover:underline">
            View Transaction History
          </a>
        </div>
      </div>
    </div>
  );
}
