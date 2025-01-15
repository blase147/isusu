'use client';

const Page = () => {
  // Sample insights data (hardcoded for now; can be fetched dynamically)
  const insights = {
    totalSavings: 0,
    totalTransactions: 0,
    upcomingPayments: 0,
  };

  return (
    <div className="flex min-h-screen text-blue-black">
      {/* Main Content */}
      <main className="flex-1 p-6 bg-white">
        {/* Insights Section */}
        <section id="insights" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-500">Dashboard Insights</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-100 p-4 rounded shadow">
              <h3 className="text-lg font-semibold">Total Savings</h3>
              <p className="text-xl font-bold">${insights.totalSavings}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h3 className="text-lg font-semibold">Total Transactions</h3>
              <p className="text-xl font-bold">{insights.totalTransactions}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h3 className="text-lg font-semibold">Upcoming Payments</h3>
              <p className="text-xl font-bold">{insights.upcomingPayments}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Page;
