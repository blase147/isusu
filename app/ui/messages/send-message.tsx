"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const SendMessage = () => {
    const { data: session } = useSession();
    const [currentUser, setCurrentUser] = useState(session?.user || null);
    const searchParams = useSearchParams();
    const currentUserIdFromURL = searchParams.get("user.id"); // Renamed from `currentUser`

    const [chat, setChat] = useState<{ messages: { id: string; text: string }[] } | null>(null);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string } | null>(null);
    const [searchInput, setSearchInput] = useState("");

    // Update currentUser when session changes
    useEffect(() => {
        console.log("Session data:", session);
        console.log("User ID from URL:", currentUserIdFromURL);

        if (session?.user) {
            setCurrentUser(session.user);
        } else if (currentUserIdFromURL) {
            setCurrentUser({ id: currentUserIdFromURL, name: "Guest" });
        } else {
            console.error("No user session or URL parameter found.");
        }
    }, [session, currentUserIdFromURL]);



    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/users");
                const data = await res.json();

                console.log("Fetched users:", data); // Debugging log

                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error("Unexpected data format:", data);
                    setUsers([]); // Ensure it's an array to prevent crashes
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
                setUsers([]); // Fallback to an empty array
            }
        };

        fetchUsers();
    }, []);


    const handleSendMessage = async () => {

        const senderId = currentUser?.id;

        // if (!senderId) {
        //     alert("Current user is not available.");
        //     return;
        // }
        const recipientId = selectedRecipient?.id;

        if (!recipientId || !message.trim()) {
            alert("Recipient and message are required.");
            return;
        }

        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ senderId, recipientId, message }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const newMessage = { id: Date.now().toString(), text: message };

            setChat((prevChat) => ({
                messages: prevChat ? [...prevChat.messages, newMessage] : [newMessage],
            }));

            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const filteredUsers = Array.isArray(users)
        ? users.filter(user =>
            user.name.toLowerCase().includes(searchInput.toLowerCase())
        )
        : [];


    return (
        <div className="max-w-lg mx-auto p-4">
            <h1 className="text-xl font-bold">Chat</h1>

            <div className="mb-2 relative">
                <label className="block text-sm font-medium">Select recipient:</label>
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full border p-2 rounded-md mt-2"
                    placeholder="Search for a recipient"
                />

                {searchInput && filteredUsers.length > 0 && (
                    <ul className="absolute w-full border p-2 rounded-md mt-1 bg-white shadow-md max-h-40 overflow-y-auto">
                        {filteredUsers.map(user => (
                            <li
                                key={user.id}
                                onClick={() => {
                                    setSelectedRecipient(user);
                                    setSearchInput(user.name);
                                }}
                                className="cursor-pointer p-2 hover:bg-gray-200"
                            >
                                {user.name}
                            </li>
                        ))}
                    </ul>
                )}

                {searchInput && filteredUsers.length === 0 && (
                    <p className="text-gray-500 mt-1">No users found</p>
                )}
            </div>

            <div className="border p-2 rounded-md h-80 overflow-y-auto">
                {chat?.messages?.map((msg) => (
                    <p key={msg.id} className="text-sm">{msg.text}</p>
                ))}
            </div>

            <div className="mt-2 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 p-2 border rounded-md text-sm"
                />
                <button
                    type="button"
                    className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || !selectedRecipient}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default SendMessage;
