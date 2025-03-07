"use client";

import React, { useEffect, useState } from "react";
import { EyeIcon, LinkIcon, PlusIcon, CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ManageIsusu = () => {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  // Function to copy invite link
  const handleCopyLink = (inviteCode: string) => {
    if (!inviteCode) {
      console.error("Invite code is missing");
      return;
    }

    const inviteLink = `${window.location.origin}/dashboard/join-isusu/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        setCopied(inviteCode);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(err => console.error("Failed to copy:", err));
  };

  // Define IsusuGroup interface
  interface IsusuGroup {
    id: string;
    invite_code: string;
    isusuName: string;
    isusuClass: string;
    frequency: string;
    milestone: number;
    members?: number;
  }

  const [createdIsusus, setCreatedIsusus] = useState<IsusuGroup[]>([]);
  const [joinedIsusus, setJoinedIsusus] = useState<IsusuGroup[]>([]);
  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");

  // Fetch isusu groups
  useEffect(() => {
    const fetchIsusuGroups = async () => {
      try {
        const response = await fetch("/api/isusu/fetch");

        if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

        const data = await response.json();
        console.log("Fetched Isusu data:", data); // Debugging step

        // Validate response structure before setting state
        if (!data || typeof data !== "object") {
          throw new Error("Invalid API response format");
        }

        setCreatedIsusus(
          Array.isArray(data.created)
            ? data.created.map((group: IsusuGroup) => ({
          ...group,
          members: typeof group.members === "number" ? group.members : 0, // Ensure members is a number
              }))
            : []
        );

        setJoinedIsusus(
          Array.isArray(data.joined)
            ? data.joined.map((group: IsusuGroup) => ({
          ...group,
          members: typeof group.members === "number" ? group.members : 0, // Ensure members is a number
              }))
            : []
        );
      } catch (error) {
        console.error("Error fetching Isusu groups:", error);
      }
    };

    fetchIsusuGroups();
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Header Buttons */}
      <div className="flex justify-end items-center space-x-4 w-full mt-8">
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

      {/* Tabs */}
      <div className="mt-6 flex border-b border-gray-300">
        <button
          className={`px-6 py-3 font-semibold ${
            activeTab === "created" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("created")}
        >
          Created Isusu
        </button>
        <button
          className={`px-6 py-3 font-semibold ${
            activeTab === "joined" ? "border-b-4 border-green-600 text-green-600" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("joined")}
        >
          Joined Isusu
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "created" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {createdIsusus.length > 0 ? (
              createdIsusus.map((group) => (
                <div key={group.id} className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      <p className="text-xl font-bold text-blue-600">{group.isusuName}</p>
                      <button
                        onClick={() => handleCopyLink(group.invite_code)}
                        className="flex items-center space-x-2 text-xs text-gray-600 hover:text-blue-600"
                      >
                        {copied === group.invite_code ? (
                          <>
                            <CheckIcon className="w-5 text-green-500" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <ClipboardIcon className="w-5 text-gray-600" />
                            <span>Copy link</span>
                          </>
                        )}
                      </button>
                    </div>
                    <Link href={`/dashboard/isusu-dashboard/${group.id}`} className="flex items-center space-x-2">
                      <span>Members: {group.members}</span>
                      <EyeIcon className="w-5 text-gray-600" />
                    </Link>
                  </div>

                  <p className="text-lg font-semibold text-black mb-4 text-center">{group.isusuClass}</p>

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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {joinedIsusus.length > 0 ? (
              joinedIsusus.map((group) => (
                <div key={group.id} className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      <p className="text-xl font-bold text-blue-600">{group.isusuName}</p>
                    </div>
                    <Link href={`/dashboard/isusu-dashboard/${group.id}`} className="flex items-center space-x-2">
                      <span>Members: {group.members ? group.members : 0}</span>
                      <EyeIcon className="w-5 text-gray-600" />
                    </Link>
                  </div>

                  <p className="text-lg font-semibold text-black mb-4 text-center">{group.isusuClass}</p>

                  <div className="flex justify-between items-center">
                    <p className="text-gray-700"><strong>Frequency:</strong> {group.frequency}</p>
                    <p className="text-gray-700"><strong>Milestone:</strong> ₦{group.milestone}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No Isusu groups joined yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageIsusu;
