import React from 'react';

const ManageIsusu = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Your Isusu</h2>
      <div className="space-y-4">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">View Contributions</button>
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg">Allocate Loan</button>
        <button className="bg-red-600 text-white px-6 py-3 rounded-lg">Generate Report</button>
      </div>
    </div>
  );
};

export default ManageIsusu;
