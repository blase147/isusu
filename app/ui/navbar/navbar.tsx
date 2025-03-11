"use client";

import { useState, useEffect, useRef } from "react";
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Notifications from "../notifications/notifications";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  interface User {
    name: string;
    email: string;
  }

  const [user, setUser] = useState<User | null>(null);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current && !notifRef.current.contains(event.target as Node) &&
        userRef.current && !userRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md px-6 py-4 fixed top-0 w-full z-50 flex justify-between items-center">
      {/* Left Section: Brand/Logo */}
      <div className="text-2xl font-bold text-gray-800">Dashboard</div>

      {/* Right Section: Icons & User Menu */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
              3
            </span>
          </button>

          {/* Dropdown Notifications */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-md rounded-md p-2 border">
              <Notifications />
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            title="User Menu"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <UserCircleIcon className="h-8 w-8" />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md p-2 border">
              <div className="px-4 py-2 text-gray-700 font-semibold border-b">
                {user ? user.name : "Loading..."}
              </div>
              <div className="px-4 py-2 text-gray-700 font-semibold border-b">
                {user ? user.email : "Loading..."}
              </div>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Profile
              </a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Settings
              </a>
              <a href="#" className="block px-4 py-2 text-red-600 hover:bg-gray-100">
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
