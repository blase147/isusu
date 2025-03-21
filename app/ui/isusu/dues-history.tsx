"use client";

import { useEffect, useState } from "react";

const DuesHistory = ({ isusuId, onClose }: { isusuId: string; onClose: () => void }) => {
  const [dues, setDues] = useState<{ paymentDate: string; amount: number; status: string }[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Close on Escape Key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fetch Dues History
  const fetchDuesHistory = async () => {
    if (!isusuId) {
      setError("Missing Isusu ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let url = `/api/isusu/dues/dues-history?isusuId=${isusuId}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }


      console.log("Fetching Dues History from:", url);

      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        setError(`Error: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      setDues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dues history.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount & when filters change
  useEffect(() => {
    fetchDuesHistory();
  }, [isusuId, startDate, endDate]);

  return (
    <div className="bg-black bg-opacity-50 flex justify-center items-center fixed inset-0 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
        {/* Close Button */}
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ✖
        </button>

        <h3 className="text-lg font-bold mt-4 text-center">📜 Dues Payment History</h3>

        {/* Date Range Filter */}
        <div className="mb-4 flex gap-2 justify-center">
          <input
            type="date"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Start Date"
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="End Date"
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={fetchDuesHistory}
          >
            Filter
          </button>
        </div>

        {/* Display Loading, Error, or Dues History */}
        {loading ? (
          <p className="text-gray-500 text-center">Loading...</p>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={fetchDuesHistory}>
              Retry
            </button>
          </div>
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
                      <td className="border border-gray-300 p-2">{new Date(due.paymentDate).toLocaleDateString()}</td>
                      <td className="border border-gray-300 p-2">N{due.amount.toLocaleString()}</td>
                      <td
                        className={`border border-gray-300 p-2 ${due.status.toLowerCase() === "completed" ? "text-green-600" : "text-red-500"
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
