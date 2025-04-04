"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

const NotificationDetails = () => {
    interface Notification {
        message: string;
        createdAt: string;
        user: {
            name: string;
            image: string;
        };
        transaction?: {
            type: string;
            amount: string;
            description: string;
            reference: string;
        };
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
                        {/* User Info */}
                        <div className="flex items-center space-x-4">
                            <Image
                                src={notification.user.image}
                                alt={notification.user.name}
                                width={56}
                                height={56}
                                className="rounded-full object-cover border"
                            />
                            <div>
                                <p className="text-lg font-medium text-gray-900">{notification.user.name}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Notification Message */}
                        <div className="bg-gray-50 border rounded-md p-4">
                            <p className="font-medium text-base text-gray-700">{notification.message}</p>
                        </div>

                        {/* Transaction Details */}
                        {notification.transaction && (
                            <div className="bg-gray-50 border rounded-lg p-4">
                                <h2 className="text-md font-semibold text-gray-800 mb-2">Transaction Details</h2>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    <li><span className="font-medium">Type:</span> {notification.transaction.type}</li>
                                    <li><span className="font-medium">Amount:</span> {notification.transaction.amount}</li>
                                    <li><span className="font-medium">Description:</span> {notification.transaction.description}</li>
                                    <li><span className="font-medium">Reference:</span> {notification.transaction.reference}</li>
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
