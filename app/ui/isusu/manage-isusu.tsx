"use client"; // ✅ Ensure it's a Client Component

import React from 'react';
import { EyeIcon, LinkIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // ✅ Use `useRouter` instead of `usePathname`

const ManageIsusu = () => {
  const router = useRouter();

  return (
    <div className="p-4 bg-gray-100 h-screen">
      {/* Header buttons aligned to the right */}
      <div className="flex justify-end items-center space-x-4 w-full">
        <button 
          type="button" 
          onClick={() => router.push("/dashboard/create-isusu/")} // ✅ Navigates correctly
          className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg space-x-2"
        >
          <PlusIcon className="w-6" />
          <span>Create Isusu</span>
        </button>
        
        <button 
          type="button" 
          onClick={() => router.push("/dashboard/join-isusu/")} // ✅ Navigates correctly
          className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg space-x-2"
        >
          <LinkIcon className="w-6" />
          <span>Join Isusu</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="flex flex-col items-center mt-8 bg-gray-200 w-[40%] p-6 rounded-lg shadow-lg mx-auto">
        {/* Cooperative Header */}
        <div className="flex items-center space-x-2 w-full mb-4">
          <p className="text-left text-xl font-bold text-blue-600 flex-1">
            Ohamazi Cooperative
          </p>
          
          <Link href="/invite" className="flex items-center space-x-2 mr-4">
            <LinkIcon className="w-4" />
            <span>Invite link</span>
          </Link>
          
          <span>Members: 10</span>
          
          <Link href="/members" className="flex items-center space-x-2">
            <EyeIcon className="w-4" />
          </Link>
        </div>

        {/* Title */}
        <p className="text-4xl font-bold mb-4 text-black">PayDay Milestone</p>

        {/* Contribution Details */}
        <div className="flex space-x-4 mt-4 w-full">
          <div className="bg-green-200 p-4 rounded-lg text-red-500 w-1/2">
            <p className="font-semibold pb-2">Frequency</p>
            <p>N25,000 / Monthly</p>
          </div>
          <div className="bg-green-500 p-4 rounded-lg w-1/2 text-yellow-900">
            <p className="font-semibold pb-2">Milestone</p>
            <p>N100,000</p>
          </div>
        </div>

        {/* View Contributions Button */}
        <button type="button" className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg">
          View Contributions
        </button>
      </div>
    </div>
  );
};

export default ManageIsusu;
