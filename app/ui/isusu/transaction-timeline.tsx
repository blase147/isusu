import { useEffect, useState } from "react";

interface Transaction {
  id: string;
  createdAt: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  description?: string;
}

export default function TransactionTimeline() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/isusu/transaction-timeline") // ✅ Updated API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        return response.json();
      })
      .then((data) => {
        setTransactions(data.transactions);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-600">Loading transactions...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Transaction Timeline</h2>
      <ul className="divide-y divide-gray-300">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <li key={tx.id} className="py-3">
              <div>
                <p className="text-gray-800 font-medium">
                  {new Date(tx.createdAt).toLocaleDateString()} - {tx.type.toUpperCase()}
                </p>
                <p className="text-sm text-gray-600">
                  Amount: <span className="font-semibold">${tx.amount.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600">Status: {tx.status}</p>
                <p className="text-sm text-gray-600">Reference: {tx.reference}</p>
                {tx.description && <p className="text-sm text-gray-500">📌 {tx.description}</p>}
              </div>
            </li>
          ))
        ) : (
          <li>
            <p className="text-gray-600">No transactions found.</p>
          </li>
        )}
      </ul>
    </div>
  );
}
