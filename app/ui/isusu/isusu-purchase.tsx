'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Dynamically import PaystackButton to avoid SSR issues
const PaystackButton = dynamic(() => import('react-paystack').then((mod) => mod.PaystackButton), { ssr: false });

const tiers = [
    { id: 1, name: 'Tier 1', price: 1000, features: ['Basic Savings', '1 Group', 'Limited Withdrawals'] },
    { id: 2, name: 'Tier 2', price: 3000, features: ['Advanced Savings', '3 Groups', 'Auto Withdrawals'] },
    { id: 3, name: 'Tier 3', price: 5000, features: ['Premium Savings', 'Unlimited Groups', 'Loan Access'] },
    { id: 4, name: 'Tier 4', price: 10000, features: ['Elite Savings', 'Investment Opportunities', 'Exclusive Events'] }
];

const IsusuPurchase = () => {
    const [selectedTier, setSelectedTier] = useState<{ id: number; name: string; price: number; features: string[] } | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true); // Ensure PaystackButton runs only on the client
    }, []);

    // Function to handle successful payments
    const onSuccess = async (reference: { transaction: string; status: string; reference: string }) => {
        console.log('Payment successful:', reference);

        try {
            const response = await fetch('/api/wallet/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipientEmail: "solarmails2@gmail.com", // Replace with dynamic user email
                    amount: selectedTier?.price, // Amount in Naira
                    transactionReference: reference.reference,
                    groupId: null, // or undefined
                    isIsusuGroup: false
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`You have successfully subscribed to ${selectedTier?.name}`);
                window.location.href = "/dashboard/create-isusu"; // Redirect after successful payment
            } else {
                console.error("Wallet update failed:", result);
                alert(`Payment recorded but wallet update failed: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating wallet:', error);
            alert('Payment was successful, but wallet update failed. Please contact support.');
}
    };


    // Paystack configuration object
    const paystackConfig = {
        email: "user@example.com",
        amount: selectedTier ? selectedTier.price * 100 : 0, // Paystack expects amount in kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        onSuccess, // Reference the function correctly
        onClose: () => alert('Payment process cancelled'), // Proper syntax
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <h2 className="text-2xl font-bold mb-6">Choose Your Isusu Tier</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {tiers.map((tier) => (
                    <div
                        key={tier.id}
                        className={`p-6 border rounded-lg shadow-md cursor-pointer ${selectedTier?.id === tier.id ? 'border-blue-600' : 'border-gray-300'}`}
                        onClick={() => setSelectedTier(tier)}
                    >
                        <h3 className="text-xl font-semibold">{tier.name}</h3>
                        <p className="text-gray-700">₦{tier.price}</p>
                        <ul className="mt-3 space-y-1">
                            {tier.features.map((feature, index) => (
                                <li key={index} className="flex items-center space-x-2 text-gray-600">
                                    <FaCheckCircle className="text-green-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {selectedTier && isClient && (
                <div className="mt-6 p-4 bg-white shadow-md rounded-lg">
                    <h3 className="text-lg font-semibold">Selected: {selectedTier.name}</h3>
                    <p>Price: ₦{selectedTier.price}</p>
                    <PaystackButton {...paystackConfig} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                        Pay
                    </PaystackButton>
                </div>
            )}
        </div>
    );
};

export default IsusuPurchase;
