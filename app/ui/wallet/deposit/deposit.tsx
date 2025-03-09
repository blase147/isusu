"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaystackButton } from "react-paystack";

export default function Deposit() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(0);
  const [publicKey, setPublicKey] = useState<string>("");
  const userEmail = "user@example.com"; // Replace with actual user email

  useEffect(() => {
    // Ensure the environment variable is only accessed on the client side
    setPublicKey(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "");
  }, []);

  const currency = "NGN"; // Nigerian Naira

  const handleSuccess = async (response: { reference: string }) => {
    console.log("Payment Success:", response);

    if (!response.reference) {
      alert("Transaction reference missing!");
      return;
    }

    try {
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
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("An error occurred while verifying payment.");
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
            min={100} // Prevent very low transactions
          />
        </div>

        {/* Only show Paystack Button if publicKey is loaded */}
        {publicKey && amount > 0 ? (
          <PaystackButton
            text="Fund Wallet"
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 w-full"
            publicKey={publicKey}
            amount={amount * 100} // Convert Naira to kobo
            email={userEmail}
            currency={currency}
            onSuccess={handleSuccess}
            onClose={() => alert("Transaction was closed!")}
          />
        ) : (
          <p className="text-red-500 text-sm text-center">Enter a valid amount to proceed.</p>
        )}
      </div>
    </div>
  );
}
