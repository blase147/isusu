"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface User {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    biography?: string;
    bankAccount?: string;
    occupation?: string;
    profilePicture?: string;
}

const UserProfile = () => {
    const { status } = useSession();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "authenticated") {
            const fetchUser = async () => {
                try {
                    const response = await fetch("/api/user");

                    if (!response.ok) throw new Error(`Error ${response.status}: Failed to fetch user data`);

                    const data = await response.json();
                    setProfile({
                        id: data.id ?? "",
                        name: data.name ?? "N/A",
                        email: data.email ?? "N/A",
                        phone: data.phone ?? "N/A",
                        dateOfBirth: data.dateOfBirth ?? "N/A",
                        address: data.address ?? "N/A",
                        biography: data.biography ?? "N/A",
                        bankAccount: data.bankAccount ?? "N/A",
                        occupation: data.occupation ?? "N/A",
                        profilePicture: data.profilePicture ?? "/default-avatar.png",
                    });
                } catch (error) {
                    console.error("Error fetching user:", error);
                    setError("Failed to load profile. Please try again.");
                } finally {
                    setLoading(false);
                }
            };
            fetchUser();
        }
    }, [status]);

    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!profile) return <p className="text-center">User not found.</p>;

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">User Profile</h2>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                    <Image
                        src={profile.profilePicture || "/default-avatar.png"}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="object-cover"
                    />
                </div>
            </div>

            {/* User Info */}
            <div className="space-y-4">
                {Object.entries(profile).map(([key, value]) =>
                    key !== "profilePicture" && key !== "id" ? (
                        <div key={key} className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700">
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                            </label>
                            <p className="mt-1 p-2 border border-gray-300 rounded-md w-full">
                                {value || "N/A"}
                            </p>
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );
};

export default UserProfile;
