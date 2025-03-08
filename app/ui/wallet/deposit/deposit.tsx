"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaystackButton } from "react-paystack";

export default function Deposit() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(0);
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ""; // Ensure this is set in .env.local

  const userEmail = "user@example.com"; // Replace with logged-in user's email
  const currency = "NGN"; // Nigerian Naira

  const handleSuccess = async (response: { reference: string }) => {
    console.log("Payment Success:", response);

    // Send payment verification request to backend with amount
    const verifyResponse = await fetch("/api/paystack/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reference: response.reference, amount }),
    });

    const result = await verifyResponse.json();
    if (result.success) {
      alert("Wallet funded successfully!");
      router.push("/dashboard/transactions"); // Redirect after funding
    } else {
      alert("Payment verification failed!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Fund Wallet</h2>
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium">Amount (₦)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 border rounded mt-1"
            title="Amount"
            placeholder="Enter amount"
          />
        </div>

        {/* Paystack Button */}
        <PaystackButton
          text="Fund Wallet"
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 w-full"
          publicKey={publicKey}
          amount={amount * 100} // Paystack expects amount in kobo
          email={userEmail}
          currency={currency}
          onSuccess={handleSuccess}
          onClose={() => alert("Transaction was closed!")}
        />
      </div>
    </div>
  );
}
