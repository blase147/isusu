"use client";

import { useState, useEffect } from "react";
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  interface User {
    name: string;
    email: string;
    // Add other user properties if needed
  }

  const [user, setUser] = useState<User | null>(null); // Store user data

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user"); // Replace with your actual API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUser(data); // Update user state with fetched data
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <nav className="bg-white shadow-md px-6 py-4 fixed top-0 w-full z-50 flex justify-between items-center">
      {/* Left Section: Brand/Logo */}
      <div className="text-2xl font-bold text-gray-800">Dashboard</div>

      {/* Right Section: Icons & User Menu */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative text-gray-600 hover:text-gray-900">
          <BellIcon className="h-6 w-6" />
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            3
          </span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            title="User Menu"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <UserCircleIcon className="h-8 w-8" />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md p-2">
              {/* Display Current User Name */}
              <div className="px-4 py-2 text-gray-700 font-semibold border-b">
                {user ? user.name : "Loading..."}
              </div>
              <div className="px-4 py-2 text-gray-700 font-semibold border-b text">
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
