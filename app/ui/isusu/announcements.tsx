"use client";

import { useState, useEffect } from "react";

const AnnouncementForm = ({
    isusuId,  // Ensure isusuId is passed as a prop
    onClose
}: {
    isusuId: string;  // Define expected prop type
    onClose: () => void;
}) => {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleAnnouncement = async () => {
        console.log("Submitting announcement:", { title, message, isusuId });

        if (!title.trim() || !message.trim()) {
            setError("All fields are required");
            return;
        }

        if (!isusuId) {
            setError("Missing isusuId. Please select a valid group.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const response = await fetch("/api/isusu/announcements", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, message, isusuId }), // Include isusuId
            });

            const responseText = await response.text(); // Capture raw response
            console.log("API Raw Response:", responseText);

            if (!response.ok) {
                throw new Error(responseText || "Failed to post announcement");
            }

            setSuccess("Announcement posted successfully!");
            setTitle("");
            setMessage("");
        } catch (error) {
            console.error("Error posting announcement:", error);
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
                <button
                    type="button"
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                    onClick={onClose}
                >
                    ✖
                </button>
                <h3 className="text-xl font-bold mb-4">📢 Make an Announcement</h3>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}

                <input
                    type="text"
                    className="border p-2 rounded block w-full mb-4"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    className="border p-2 rounded block w-full mb-4 h-24"
                    placeholder="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
                    onClick={handleAnnouncement}
                    disabled={loading}
                >
                    {loading ? "Posting..." : "Post Announcement"}
                </button>
            </div>
        </div>
    );
};

export default AnnouncementForm;
