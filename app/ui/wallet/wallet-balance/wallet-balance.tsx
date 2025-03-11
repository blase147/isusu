// components/WalletBalance.js
import { useEffect, useState } from "react";
import { useWalletStore } from "../../.././lib/store/wallet";

interface WalletStore {
  balance: number;
  updateBalance: (balance: number) => void;
}


export default function WalletBalance() {
  const [loading, setLoading] = useState(true);
  const { balance, updateBalance } = useWalletStore() as WalletStore;
  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch("/api/wallet");
        const data = await res.json();
        if (res.ok) updateBalance(data.balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBalance();
  }, [updateBalance]);

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">Wallet Balance</h2>
      {loading ? <p>Loading...</p> : <p className="text-2xl font-bold">${balance.toFixed(2)}</p>}
    </div>
  );
}
