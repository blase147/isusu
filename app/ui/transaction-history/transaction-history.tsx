import React from 'react';

const TransactionHistory = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Transaction Type</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Example transaction data */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">01/01/2025</td>
            <td className="border border-gray-300 px-4 py-2">Deposit</td>
            <td className="border border-gray-300 px-4 py-2">$500</td>
            <td className="border border-gray-300 px-4 py-2">Completed</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">02/01/2025</td>
            <td className="border border-gray-300 px-4 py-2">Withdrawal</td>
            <td className="border border-gray-300 px-4 py-2">$200</td>
            <td className="border border-gray-300 px-4 py-2">Pending</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
