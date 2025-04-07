"use client";

import { useState, useEffect, useRef } from "react";
import { BellIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Notifications from "../notifications/notifications";
import Chats from "../messages/messages";
import Image from "next/image";
import { PowerIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { signOut } from './../../lib/auth';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  interface NavbarNotification {
    id: string;
    isRead: boolean; // Boolean for read status
    userId: string;
    type: string;
    message: string;
    createdAt: string;
  }

  const [notifications, setNotifications] = useState<NavbarNotification[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  interface User {
    id: string; // Added id property
    name: string;
    email: string;
    profilePicture?: string;
  }

  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();

        // Use provided profile picture, or fallback to a default image
        setUser({
          ...data,
          profilePicture: data.profilePicture?.startsWith("http")
            ? data.profilePicture
            : "/avatar.png", // Ensure default is used only if null/empty
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch notifications and messages
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifResponse = await fetch("/api/notifications");
        const chatResponse = await fetch("/api/messages");

        if (notifResponse.ok) {
          const notifData = await notifResponse.json();
          setNotifications(notifData as NavbarNotification[]);
          setNotificationCount(notifData.filter((n: NavbarNotification) => !n.isRead).length); // Filter based on isRead
        }

        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          setUnreadMessageCount(chatData.length);
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current && !notifRef.current.contains(event.target as Node) &&
        chatRef.current && !chatRef.current.contains(event.target as Node) &&
        userRef.current && !userRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
        setIsOpen(false);
        setIsChatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (id: string) => {
    const notification = notifications.find((n) => n.id === id);

    if (notification && !notification.isRead) {
      try {
        const response = await fetch(`/api/notifications/notification-details?id=${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // If your backend doesn't need this Authorization header, you can remove it
            Authorization: `Bearer ${user?.email}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }

        const data = await response.json();

        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setNotificationCount((prevCount) => prevCount - 1);

        console.log("Notification marked as read:", data);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };



  return (
    <nav className="bg-white shadow-md px-6 py-4 fixed top-0 w-full z-50 flex justify-between items-center">
      <div className="text-2xl font-bold text-gray-800">Dashboard</div>
      <div className="flex items-center gap-4">
        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            title="Notifications"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <BellIcon className="h-6 w-6" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {notificationCount}
              </span>
            )}
          </button>
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-md rounded-md p-2 border">
              <Notifications

                notifications={notifications}
                onNotificationClick={handleNotificationClick}
              />
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="relative" ref={chatRef}>
          <button
            type="button"
            title="Messages"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="relative text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <ChatBubbleLeftIcon className="h-6 w-6" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadMessageCount || 0}
              </span>
            )}
          </button>
          {isChatOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-md rounded-md p-2 border">
              <Chats />
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            title="User Menu"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none rounded-full"
          >
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt="User"
                width={32}
                height={32}
                className="w-8 h-8 object-cover rounded-full" // ✅ Fix size
                unoptimized={user.profilePicture.includes("cloudinary")}
              />
            ) : (
              <Image
                src="/avatar.png"
                alt="Default Avatar"
                width={32}
                height={32}
                className="w-8 h-8 object-cover rounded-full" // ✅ Fix size
              />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md p-2 border">
              <div className="px-4 py-2 text-gray-700 font-semibold border-b flex items-center gap-2">
                <span>{user ? user.name : "Loading..."}</span>
              </div>
              <div className="px-4 py-2 text-gray-700 text-sm font-semibold border-b flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 shrink-0" />
                <span className="truncate">{user ? user.email : "Loading..."}</span>
              </div>
              {/* Updated Profile Link to include userId */}
              <a
                href={`/dashboard/user-profile?userId=${user?.id}`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <UserIcon className="w-5 h-5" /> Profile
              </a>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex h-[48px] w-full grow items-center justify-left gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
                >
                  <PowerIcon className="w-6" />
                  <div className="hidden md:block">Sign Out</div>
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
