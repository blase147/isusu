import { useEffect, useState } from "react";

export default function TransactionTimeline() {
  interface Transaction {
    date: string;
    description: string;
    amount: number;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/isusu/transactions-timeline")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Transaction Timeline</h2>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index} className="border-b py-2">
            {transaction.date}: {transaction.description} - ${transaction.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}
