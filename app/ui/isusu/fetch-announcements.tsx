"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AnnouncementsList = ({ isusuId }: { isusuId: string }) => {
    interface Announcement {
        id: string;
        title: string;
        message: string;
        createdAt: string;
    }

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch(`/api/isusu/announcements/fetch-announcements?isusuId=${isusuId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch announcements");
                }

                setAnnouncements(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [isusuId]);

    if (loading) return <p>Loading announcements...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (announcements.length === 0) return <p>No announcements yet.</p>;

    // Handle next and previous announcement
    const nextAnnouncement = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    };

    const prevAnnouncement = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + announcements.length) % announcements.length);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md relative w-full max-w-lg mx-auto">
            <h3 className="text-xl font-bold mb-4 text-center">📢 Group Announcements</h3>

            <AnimatePresence mode="wait">
                <motion.div
                    key={announcements[currentIndex].id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(event, info) => {
                        if (info.offset.x < -50) {
                            nextAnnouncement(); // Swipe left for next
                        } else if (info.offset.x > 50) {
                            prevAnnouncement(); // Swipe right for previous
                        }
                    }}
                    className="border p-4 rounded-lg text-center cursor-grab active:cursor-grabbing"
                >
                    <h4 className="text-lg font-semibold">{announcements[currentIndex].title}</h4>
                    <p className="text-gray-600">{announcements[currentIndex].message}</p>
                    <small className="text-gray-400">
                        Posted on {new Date(announcements[currentIndex].createdAt).toLocaleString()}
                    </small>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {announcements.length > 1 && (
                <div className="flex justify-between mt-4">
                    <button onClick={prevAnnouncement} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        ◀ Prev
                    </button>
                    <button onClick={nextAnnouncement} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        Next ▶
                    </button>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsList;
