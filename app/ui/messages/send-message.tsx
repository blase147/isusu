"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../lib/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import Image from "next/image";

const SendMessage = () => {
    const searchParams = useSearchParams();
    const recipientId = searchParams.get("userId");

    interface User {
        id: string;
        email: string;
        name?: string;
        profilePicture?: string;
    }

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [recipientProfile, setRecipientProfile] = useState<User | null>(null);
    const [chat, setChat] = useState<{ id: string; text: string; senderId: string; recipientId: string; timestamp: Timestamp }[]>([]);
    const [message, setMessage] = useState("");

    // Fetch current user details from API
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch(`/api/user`);
                const data = await response.json();

                if (response.ok) {
                    setCurrentUser({
                        id: data.id,  // Include the id here
                        email: data.email,
                        name: data.name ?? "Unknown",
                        profilePicture: data.profilePicture ?? "/avatar.png",
                    });
                } else {
                    console.error("Failed to fetch current user:", data.error);
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch recipient profile
    useEffect(() => {
        if (!recipientId) return;

        const fetchRecipientProfile = async () => {
            try {
                const response = await fetch(`/api/user/${recipientId}`);
                const data = await response.json();

                if (response.ok) {
                    setRecipientProfile({
                        id: data.id,  // Include the id here
                        email: data.email,
                        name: data.name ?? "Unknown",
                        profilePicture: data.profilePicture ?? "/avatar.png",
                    });
                } else {
                    console.error("Failed to fetch recipient:", data.error);
                }
            } catch (error) {
                console.error("Error fetching recipient profile:", error);
            }
        };

        fetchRecipientProfile();
    }, [recipientId]);

    // Fetch chat history from Firestore
    useEffect(() => {
        if (!recipientProfile?.email || !currentUser?.email) return;

        console.log("Fetching chat messages...");

        const chatQuery = query(
            collection(db, "messages"),
            where("recipientId", "in", [recipientProfile.id, currentUser.id]),  // Query based on ids
            where("senderId", "in", [recipientProfile.id, currentUser.id]),  // Query based on ids
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as {
                    text: string;
                    senderId: string;
                    recipientId: string;
                    timestamp: Timestamp;
                }),
            }));

            setChat(messages);
        });

        return () => unsubscribe();
    }, [recipientProfile?.id, currentUser?.id]);  // Use ids for accurate query

    // Send message to Firestore
    const handleSendMessage = async () => {
        if (!message.trim() || !recipientProfile?.email || !currentUser?.email) return;

        try {
            await addDoc(collection(db, "messages"), {
                text: message,
                senderId: currentUser.id,  // Include sender's id
                recipientId: recipientProfile.id,  // Include recipient's id
                timestamp: serverTimestamp(),
            });

            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Handle Enter key press
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="max-w-lg mx-auto p-4">
            {recipientProfile ? (
                <div className="flex items-center gap-2 mt-4">
                    <Image
                        src={recipientProfile.profilePicture || "/avatar.png"}
                        alt="Recipient Profile"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <span className="text-sm font-medium">Chatting with {recipientProfile.name}</span>
                </div>
            ) : (
                <p className="text-red-500 text-sm">Recipient not found!</p>
            )}

            <div className="border p-2 rounded-md h-80 overflow-y-auto mt-4 flex flex-col">
                {chat.length > 0 ? (
                    chat.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-2 mb-2 rounded-md max-w-xs ${msg.senderId === currentUser?.id ? "bg-blue-500 text-white self-end" : "bg-gray-300 text-black self-start"}`}
                        >
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm text-center mt-2">No messages yet</p>
                )}
            </div>

            <div className="mt-2 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 p-2 border rounded-md text-sm"
                />
                <button
                    type="button"
                    className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default SendMessage;
