"use client"; 

import React, { useEffect, useState } from "react";
import { EyeIcon, LinkIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ManageIsusu = () => {
  const router = useRouter();
  interface IsusuGroup {
    id: string;
    isusuName: string;
    isusuClass: string;
    frequency: string;
    milestone: number;
  }

  const [isusuGroups, setIsusuGroups] = useState<IsusuGroup[]>([]);

  useEffect(() => {
    const fetchIsusuGroups = async () => {
      try {
        const response = await fetch("/api/isusu");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setIsusuGroups(data);
      } catch (error) {
        console.error("Error fetching Isusu groups:", error);
      }
    };

    fetchIsusuGroups();
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Header Buttons */}
      <div className="flex justify-end items-center space-x-4 w-full">
        <button 
          type="button" 
          onClick={() => router.push("/dashboard/create-isusu/")}
          className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg space-x-2"
        >
          <PlusIcon className="w-6" />
          <span>Create Isusu</span>
        </button>

        <button 
          type="button" 
          onClick={() => router.push("/dashboard/join-isusu/")}
          className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg space-x-2"
        >
          <LinkIcon className="w-6" />
          <span>Join Isusu</span>
        </button>
      </div>

      {/* Isusu Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {isusuGroups.length > 0 ? (
          isusuGroups.map((group) => (
            <div key={group.id} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xl font-bold text-blue-600">{group.isusuName}</p>
                <Link href={`/dashboard/isusu/${group.id}`} className="flex items-center space-x-2">
                  <EyeIcon className="w-5 text-gray-600" />
                </Link>
              </div>

              <p className="text-lg font-semibold text-black mb-2">{group.isusuClass}</p>

              <div className="flex justify-between items-center">
                <p className="text-gray-700"><strong>Frequency:</strong> {group.frequency}</p>
                <p className="text-gray-700"><strong>Milestone:</strong> ₦{group.milestone}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No Isusu groups created yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageIsusu;
