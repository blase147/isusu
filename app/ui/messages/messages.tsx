"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; // Import Image from Next.js

export default function Messages() {
    // Removed unused loading state
    const [error, setError] = useState<string | null>(null);
    const [recentChats, setRecentChats] = useState<Chat[]>([]);
    const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
    const [selectedTab, setSelectedTab] = useState<"inbox" | "general">("inbox");

    interface Chat {
        id: string;
        user: {
            name: string;
            profilePicture?: string;
        };
        lastMessage: string;
        type: "inbox" | "general"; // Add type to distinguish messages
    }

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await fetch("/api/messages");
                const data = await response.json();

                console.log("API response:", data); // Debug API response structure

                if (response.ok && data.messages) {
                    setRecentChats(data.messages); // Extract messages array
                    setFilteredChats(data.messages);
                } else {
                    console.error("Unexpected API response format:", data);
                    setError("Unexpected API response format");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setError(error instanceof Error ? error.message : "An unknown error occurred.");
            }
        };

        fetchChats();
    }, []);


    useEffect(() => {
        setFilteredChats(recentChats.filter(chat => chat.type === selectedTab));
    }, [selectedTab, recentChats]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setFilteredChats(
            recentChats.filter(
                (chat) =>
                    chat.type === selectedTab &&
                    (chat.user.name.toLowerCase().includes(searchTerm) ||
                        chat.lastMessage.toLowerCase().includes(searchTerm))
            )
        );
    };

    return (
        <div className="max-w-2xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
            <h2>Chats</h2>

            {/* Search Messages */}
            <div className="p-2">
                <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full p-2 border rounded-md text-sm"
                    onChange={handleSearch}
                />
            </div>

            {/* Tabs */}
            <div className="flex border-b">
                <button
                    type="button"
                    className={`flex-1 p-2 text-center ${selectedTab === "inbox" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
                    onClick={() => setSelectedTab("inbox")}
                >
                    Inbox
                </button>
                <button
                    type="button"
                    className={`flex-1 p-2 text-center ${selectedTab === "general" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
                    onClick={() => setSelectedTab("general")}
                >
                    General
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-500 text-sm p-2">
                    {error}
                </div>
            )}

            {/* Messages List */}
            <ul className="max-h-60 overflow-y-auto">
                {filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                        <li key={chat.id} className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                            {chat.user?.profilePicture && (
                                <Image
                                    src={chat.user.profilePicture}
                                    alt={`${chat.user.name}'s profile picture`}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            )}
                            <div>
                                <p className="text-sm font-semibold">{chat.user?.name || "Unknown user"}</p>
                                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="text-gray-500 p-2 text-center">No messages found.</li>
                )}
            </ul>

            {/* New Chat Icon */}
            <div className="absolute top-2 right-4">
                <button
                    type="button"
                    title="New Chat"
                    className="text-gray-600 hover:text-gray-900 focus:outline-none"
                    onClick={() => {
                        window.location.href = "/dashboard/send-message";
                        console.log("New chat button clicked");
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
