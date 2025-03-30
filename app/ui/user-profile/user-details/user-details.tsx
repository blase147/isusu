"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface User {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    biography?: string;
    bankAccount?: string;
    occupation?: string;
    profilePicture?: string; // Ensure this is a string (URL)
}

const UserDetails = () => {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId"); // Get userId from URL query
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setError("No user ID provided.");
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                console.log("Fetching user data for ID:", userId);
                const response = await fetch(`/api/user/${userId}`);

                if (!response.ok) {
                    console.error("Error fetching user:", response.status, response.statusText);
                    throw new Error(`Failed to fetch user data (${response.status})`);
                }

                const data: User = await response.json();
                console.log("Fetched user data:", data);
                setProfile(data);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };


        fetchUser();
    }, [userId]);

    if (loading) return <p>Loading...</p>;
    if (!profile) return <p>{error || "Error loading profile."}</p>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">User Profile</h2>
            </div>

            <div className="flex flex-col items-center mb-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                    <Image
                        src={profile.profilePicture || "/avatar.png"}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {Object.entries(profile).map(([key, value]) => {
                    if (key === "profilePicture" || key === "id") return null;

                    const displayValue =
                        key === "dateOfBirth"
                            ? new Date(value).toISOString().split("T")[0] // Formats to "YYYY-MM-DD"
                            : value?.toString() || "N/A";

                    return (
                        <div key={key} className="border-b pb-2">
                            <h3 className="text-lg font-semibold text-gray-700">
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                            </h3>
                            <p className="text-gray-600">{displayValue}</p>
                        </div>
                    );
                })}
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

export default UserDetails;
