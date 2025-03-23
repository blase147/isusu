"use client"

import { useEffect, useState } from "react";

export default function TransactionHistory({ userId }: { userId: string }) {
  interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch(`/api/wallet/transactions?userId=${userId}`);
        const data = await res.json();
        if (res.ok) setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [userId]);

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">Transaction History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <ul className="mt-2">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className={`p-2 border-b ${tx.type === "deposit" ? "text-green-500" : "text-red-500"}`}
            >
              {tx.type === "deposit" ? "+" : "-"}${tx.amount} - {tx.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
