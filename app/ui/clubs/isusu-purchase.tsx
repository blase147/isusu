"use client";

import { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const tiers = [
    { id: 1, name: 'Tier 1', price: 1000, features: ['Wallet Balance is visible to all members', 'Group transactions are visible to all members', 'Limited Withdrawals', 'Only one Admin', 'No Loan Access', 'No Investment Opportunities'] },
    { id: 2, name: 'Tier 2', price: 3000, features: ['Wallet Balance is visible to only Admin', 'All Withdrawals are visible to only Admin', 'Only one Admin', 'Auto Withdrawals', 'Loan Access', 'No Investment Opportunities'] },
    { id: 3, name: 'Tier 3', price: 5000, features: ['Wallet Balance is visible to all members', 'All group transactions are visible to all members', 'Three (3) Executives', 'Three Signatories to Account', 'Loan Access'] },
    { id: 4, name: 'Tier 4', price: 10000, features: ['Wallet Balance is not visible to all members', 'Withdrawals not visible to members except Admins/Executives', 'Three (3) Executives', 'Three Signatories to Account', 'Loan Access', 'Investment Opportunities'] },
];

const IsusuPurchase = () => {
    const [selectedTier, setSelectedTier] = useState<{ id: number; name: string; price: number; features: string[] } | null>(null);
    const router = useRouter();

    const handleNext = () => {
        if (!selectedTier) {
            alert("Please select a tier first.");
            return;
        }

        // Encode tier name to prevent URL issues with spaces
        const tierNameEncoded = encodeURIComponent(selectedTier.name);
        router.push(`/dashboard/create-isusu?tierId=${selectedTier.price}&tierName=${tierNameEncoded}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <h2 className="text-2xl font-bold mb-6">Choose Your Isusu Tier</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
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

            <button
                onClick={handleNext}
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
                Next
            </button>
        </div>
    );
};

export default IsusuPurchase;
