"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

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

const UserProfile = () => {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>({} as User);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/user");
                if (!response.ok) throw new Error("Failed to fetch user data");
                const data: User = await response.json();
                setProfile(data);
                setFormData(data);
            } catch {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const toggleEdit = () => setIsEditing((prev) => !prev);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];

        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);

            // Convert file to a Data URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, profilePicture: reader.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please select a valid image file.");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedFields: Record<string, string | File> = {};

        if (profile) {
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== profile[key as keyof User] && key !== "profilePicture") {
                    updatedFields[key] = value as string;
                }
            });
        }

        if (selectedFile) {
            updatedFields["image"] = selectedFile;
        }

        if (Object.keys(updatedFields).length === 0) {
            alert("No changes detected.");
            return;
        }

        const updateFormData = new FormData();
        Object.entries(updatedFields).forEach(([key, value]) => {
            updateFormData.append(key, value instanceof File ? value : value as string);
        });

        try {
            const response = await fetch("/api/user/user-update", {
                method: "PUT",
                body: updateFormData,
            });
            const result = await response.json();

            if (response.ok) {
                alert("Profile updated successfully!");
                setProfile((prev) => ({ ...prev, ...updatedFields } as User));
                setIsEditing(false);
            } else {
                alert(`Update failed: ${result.error}`);
            }
        } catch {
            alert("Network error. Please try again.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!profile) return <p>Error loading profile.</p>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">User Profile</h2>
                <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={toggleEdit}
                >
                    {isEditing ? "Cancel" : "Edit Profile"}
                </button>
            </div>

            <div className="flex flex-col items-center mb-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                    <Image
                        src={formData.profilePicture && typeof formData.profilePicture === "string"
                            ? formData.profilePicture
                            : "/avatar.png"}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>


                {isEditing && (
                    <label className="mt-2 text-sm">
                        Upload Profile Picture
                        <input type="file" accept="image/*" onChange={handleFileChange} className="mt-2 text-sm" />
                    </label>
                )}
            </div>

            <div className="space-y-4">
                {Object.entries(profile).map(([key, value]) => {
                    if (key === "profilePicture" || key === "id") return null;

                    // Ensure only renderable types are displayed
                    const displayValue =
                        key === "dateOfBirth"
                            ? new Date(value).toISOString().split("T")[0] // Formats to "YYYY-MM-DD"
                            : value instanceof File
                                ? value.name
                                : value?.toString() || "N/A";


                    return (
                        <div key={key} className="border-b pb-2">
                            <h3 className="text-lg font-semibold text-gray-700">
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                            </h3>
                            {isEditing ? (
                                key === "biography" ? (
                                    <textarea
                                        name={key}
                                        value={formData[key as keyof User] as string || ""}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        placeholder={`Enter ${key}`}
                                    />
                                ) : (
                                    <input
                                        type={key === "dateOfBirth" ? "date" : "text"}
                                        name={key}
                                        value={formData[key as keyof User] as string || ""}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        placeholder={`Enter ${key}`}
                                    />
                                )
                            ) : (
                                <p className="text-gray-600">{displayValue}</p>
                            )}
                        </div>
                    );
                })}

            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            {isEditing && (
                <div className="mt-4">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={handleUpdate}
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
