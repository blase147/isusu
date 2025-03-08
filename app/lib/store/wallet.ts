// store/walletStore.js
import { create } from "zustand";

export const useWalletStore = create((set) => ({
  balance: 0,
  updateBalance: (newBalance: number) => set({ balance: newBalance }),
}));
