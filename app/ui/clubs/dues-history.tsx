"use client";

import { useEffect, useState } from "react";
import { useCallback } from "react";

const DuesHistory = ({ isusuId, onClose }: { isusuId: string; onClose: () => void }) => {
  const [dues, setDues] = useState<{ date: string; amount: number; status: string }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const fetchDuesHistory = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/api/isusu/dues-history";

      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch dues history");
      }

      const data = await response.json();
      setDues(data);
    } catch {
      setError("Failed to load dues history");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchDuesHistory();
  }, [isusuId, fetchDuesHistory]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative modal-center">
        <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-900" onClick={onClose}>
          ✖
        </button>
        <h2 className="text-xl font-bold mb-4">📜 Dues History</h2>

        {/* Date Range Filter */}
        <div className="mb-4 flex gap-2">
          <input
            type="date"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Start Date"
            placeholder="Start Date"
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="End Date"
            placeholder="End Date"
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={fetchDuesHistory}
          >
            Filter
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-y-auto max-h-80">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Amount</th>
                  <th className="border border-gray-300 p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {dues?.length ? (
                  dues.map((due, index) => (
                    <tr key={index} className="text-center">
                      <td className="border border-gray-300 p-2">{due.date}</td>
                      <td className="border border-gray-300 p-2">N{due.amount.toLocaleString()}</td>
                      <td
                        className={`border border-gray-300 p-2 ${
                          due.status === "Paid" ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {due.status}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500 p-4">
                      No dues found for the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuesHistory;

