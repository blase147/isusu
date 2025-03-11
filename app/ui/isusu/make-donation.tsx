"use client";

import { useState } from "react";

const MakeDonation = ({ isusuId, onClose }: { isusuId: string; onClose: () => void }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/isusu/make-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description, isusuId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to process donation");

      setMessage("Donation successful!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-900" onClick={onClose}>
          ✖
        </button>
        <h2 className="text-xl font-bold mb-4">🎁 Make a Donation</h2>

        {message && <p className="text-center mb-4 text-green-600">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Donation Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full rounded mb-2"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full rounded mb-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 w-full rounded mt-2 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Processing..." : "Donate"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MakeDonation;
