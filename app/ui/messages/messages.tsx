"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    collection, query, where, orderBy, onSnapshot, getDocs, Timestamp
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function Messages() {
    const [error, setError] = useState<string | null>(null);
    const [recentChats, setRecentChats] = useState<Chat[]>([]);
    const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
    const [selectedTab, setSelectedTab] = useState<"inbox" | "general">("inbox");
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const router = useRouter();

    interface User {
        id: string;
        email: string;
        name: string;
        profilePicture?: string;
    }

    interface Chat {
        id: string;
        user: {
            id: string;
            name: string;
            profilePicture?: string;
        };
        lastMessage: string;
        type: "inbox" | "general";
    }

    interface Message {
        id: string;
        senderId: string;
        recipientId: string;
        text: string;
        timestamp: Timestamp;
    }

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch(`/api/user`);
                const data = await response.json();

                if (response.ok && data?.id) {
                    setCurrentUser({
                        id: data.id,
                        email: data.email,
                        name: data.name ?? "Unknown",
                        profilePicture: data.profilePicture ?? "/avatar.png",
                    });
                } else {
                    setError("Failed to fetch current user.");
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
                setError("Network error fetching user.");
            }
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const inboxQuery = query(
            collection(db, "messages"),
            where("recipientId", "==", currentUser.id),
            orderBy("timestamp", "desc")
        );

        const sentQuery = query(
            collection(db, "messages"),
            where("senderId", "==", currentUser.id),
            orderBy("timestamp", "desc")
        );

        const unsubscribeInbox = onSnapshot(inboxQuery, handleSnapshot);
        const unsubscribeSent = onSnapshot(sentQuery, handleSnapshot);

        function handleSnapshot() {
            Promise.all([getDocs(inboxQuery), getDocs(sentQuery)]).then(async ([inboxSnap, sentSnap]) => {
                const allMessages = [...inboxSnap.docs, ...sentSnap.docs].map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Message[];

                const grouped = new Map<string, Message>();

                allMessages.forEach(msg => {
                    const otherParty = currentUser && msg.senderId === currentUser.email ? msg.recipientId : msg.senderId;

                    if (!grouped.has(otherParty) || grouped.get(otherParty)!.timestamp.toMillis() < msg.timestamp.toMillis()) {
                        grouped.set(otherParty, msg);
                    }
                });

                const updatedChats: Chat[] = await Promise.all(
                    Array.from(grouped.entries()).map(async ([otherEmail, latestMsg]) => {
                        // Fetch user data using your API
                        const userDetails: User = {
                            id: otherEmail, // Temporarily store email
                            email: otherEmail,
                            name: otherEmail,
                            profilePicture: "/avatar.png"
                        };

                        try {
                            // Make a request to your user API here
                            const userResponse = await fetch(`/api/user/${otherEmail}`);
                            const userData = await userResponse.json();

                            if (userResponse.ok) {
                                // Update user details
                                userDetails.id = userData.id || otherEmail; // Ensure it has the correct ID
                                userDetails.name = userData.name || otherEmail;
                                userDetails.profilePicture = userData.profilePicture || "/avatar.png";
                            } else {
                                console.warn("User data fetch failed for:", otherEmail);
                            }
                        } catch {
                            console.warn("Error fetching user data for", otherEmail);
                        }

                        return {
                            id: latestMsg.id,
                            lastMessage: latestMsg.text,
                            type: "inbox",
                            user: userDetails
                        };
                    })
                );

                setRecentChats(updatedChats);
                setFilteredChats(updatedChats);
            });
        }

        return () => {
            unsubscribeInbox();
            unsubscribeSent();
        };
    }, [currentUser]);

    const handleChatClick = async (messageId: string, recipientId: string) => {
        console.log("Chat selected - Message ID:", messageId, "Recipient ID:", recipientId);

        const chatRef = collection(db, "messages");
        const chatSnapshot = await getDocs(query(
            chatRef,
            where("recipientId", "==", recipientId),
            orderBy("timestamp", "asc")
        ));

        const messages = chatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];

        setFilteredChats(
            messages.map((message) => ({
                id: message.id,
                lastMessage: message.text || "No messages yet",
                type: "inbox",
                user: {
                    id: message.senderId,
                    name: "Unknown user",
                    profilePicture: "/avatar.png",
                },
            }))
        );

        console.log("Chat selected - Message ID:", messageId, "Recipient ID:", recipientId);

        // You already have chat.user.id in the UI (which should be the actual userId)
        // So just use that instead of recipientId/email

        const chatPartnerId = recipientId; // This should now be the real UID, not an email

        router.push(`/dashboard/send-message?userId=${encodeURIComponent(chatPartnerId)}`);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (!searchTerm) {
            setFilteredChats([...recentChats]);
            return;
        }

        setFilteredChats(
            recentChats.filter((chat) =>
                chat.user.name.toLowerCase().includes(searchTerm) ||
                (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchTerm))
            )
        );
    };

    return (
        <div className="max-w-2xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
            <h2>Chats</h2>

            <div className="p-2">
                <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full p-2 border rounded-md text-sm"
                    onChange={handleSearch}
                />
            </div>

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

            {error && <div className="text-red-500 text-sm p-2">{error}</div>}

            <ul className="max-h-60 overflow-y-auto">
                {filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                        chat.user.id !== currentUser?.id && ( // Only render chat details for other users
                            <li
                                key={chat.id}
                                className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleChatClick(chat.id, chat.user.id)}
                            >
                                <div className="flex items-center">
                                    <Image
                                        src={chat.user.profilePicture || "/avatar.png"} // Fallback to default avatar if no picture
                                        alt={chat.user.name}
                                        width={40} // Set width for optimization
                                        height={40} // Set height for optimization
                                        className="w-10 h-10 object-cover rounded-full mr-3" // Styling the profile picture
                                    />
                                    <div>
                                        <p className="font-medium">{chat.user.name}</p>
                                        <p className="text-sm text-gray-500">{chat.lastMessage}</p>
                                    </div>
                                </div>
                            </li>
                        )
                    ))
                ) : (
                    <li className="p-2 text-gray-500">No messages found.</li>
                )}
            </ul>


        </div>
    );
}
