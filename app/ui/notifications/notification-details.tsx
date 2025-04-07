"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

const NotificationDetails = () => {
    interface Notification {
        message: string;
        createdAt: string;
        type: string;
        user: {
            name: string;
            profilePicture: string;
        };
        sender?: {
            name: string;
            profilePicture: string;
        };
        transaction?: {
            type: string;
            amount: string;
            description: string;
            reference: string;
        };
        recipient?: {
            name: string;
            profilePicture: string;
            isusuId?: string; // ID for Isusu (optional)
        };
        isusu?: {
            isusuName?: string;
            isusuImage?: string; // Image for Isusu (optional)
        };
        isusuName?: string;
        isusuImage?: string; // Image for Isusu (optional)
    }


    const [notification, setNotification] = useState<Notification | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const params = useParams();
    const id = params?.id as string;

    useEffect(() => {
        if (!id) return;

        const fetchNotificationDetails = async () => {
            try {
                const response = await fetch(`/api/notifications/notification-details?id=${id}`);
                const data = await response.json();

                if (response.ok) {
                    setNotification(data);
                } else {
                    setError(data.error || "Failed to load notification details.");
                }
            } catch {
                setError("An error occurred while fetching the notification details.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotificationDetails();
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Notification Details</h1>

                {loading && (
                    <p className="text-blue-600 animate-pulse">Loading...</p>
                )}

                {error && (
                    <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
                )}

                {!loading && !error && notification && (
                    <div className="space-y-6">
                        {/* Transaction Participants */}
                        <div className="flex items-center justify-center space-x-6">
                            {/* Sender */}
                            <div className="flex flex-col items-center">
                                <Image
                                    src={notification?.sender?.profilePicture || "/avatar.png"}
                                    alt={notification?.sender?.name || "Sender"}
                                    width={100}
                                    height={100}
                                    className="w-[100px] h-[100px] object-cover rounded-full"
                                />
                                <p className="text-sm text-gray-700 mt-1">{notification?.sender?.name}</p>
                                <span className="text-xs text-gray-500">Sender</span>
                            </div>

                            {/* Arrow + Label */}
                            <div className="flex flex-col items-center text-gray-500">
                                <span className="text-lg">➡️</span>
                                <span className="text-xs font-semibold text-gray-600 mt-1">
                                    {notification?.type || "Transaction"}
                                </span>
                            </div>
                            {/* Receiver */}
                            <div className="flex flex-col items-center">
                                <Image
                                    src={notification?.recipient?.profilePicture || notification?.isusu?.isusuImage || "/avatar.png"}
                                    alt={notification?.recipient?.name || "Receiver"}
                                    width={100}
                                    height={100}
                                    className="w-[100px] h-[100px] object-cover rounded-full"
                                />
                                <p className="text-sm text-gray-700 mt-1">{notification?.isusu?.isusuName || notification?.recipient?.name}</p>
                                <span className="text-xs text-gray-500">Receiver</span>
                            </div>
                        </div>


                        {/* Notification Message */}
                        <div className="bg-gray-50 border rounded-md p-4">
                            <p className="font-medium text-base text-gray-700">{notification.message}</p>
                        </div>

                        {/* Transaction Details */}
                        {notification && (
                            <div className="bg-gray-50 border rounded-lg p-4">
                                <h2 className="text-md font-semibold text-gray-800 mb-2">Transaction Details</h2>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    <li><span className="font-medium">Type:</span> {notification.type}</li>
                                    <li><span className="font-medium">Amount:</span> {notification.createdAt}</li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {!loading && !error && !notification && (
                    <p className="text-gray-500">No notification found.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationDetails;
