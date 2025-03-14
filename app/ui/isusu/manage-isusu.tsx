"use client";

import React, { useEffect, useState } from "react";
import {
  EyeIcon,
  LinkIcon,
  PlusIcon,
  CheckIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define IsusuGroup interface
interface IsusuGroup {
  id: string;
  invite_code: string;
  isusuName: string;
  isusuClass: string;
  frequency: string;
  milestone: number;
  members?: number | { id: string; name: string }[];
  isActive?: boolean;
}

const ManageIsusu = () => {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null);  const [activeGroups, setActiveGroups] = useState<{ [key: string]: boolean }>({});
  const [createdIsusus, setCreatedIsusus] = useState<IsusuGroup[]>([]);
  const [joinedIsusus, setJoinedIsusus] = useState<IsusuGroup[]>([]);
  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");

  // Function to generate invite code
  const handleCopyCode = (inviteCode: string, groupId: string) => {
    if (!inviteCode) return console.error("Invite code is missing");

    navigator.clipboard.writeText(inviteCode)
      .then(() => {
        setCopiedCode(groupId);
        setTimeout(() => setCopiedCode(null), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  // Function to copy invite link
  const handleCopyLink = (inviteCode: string, groupId: string) => {
    if (!inviteCode) return console.error("Invite code is missing");

    const inviteLink = `${window.location.origin}/dashboard/join-isusu?invite=${inviteCode}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        setCopiedInvite(groupId);
        setTimeout(() => setCopiedInvite(null), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };
  // Fetch Isusu groups on component mount
  useEffect(() => {
    const fetchIsusuGroups = async () => {
      try {
        const response = await fetch("/api/isusu/fetch");
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

        const data = await response.json();
        console.log("Fetched isusu data:", data);

        if (!data || typeof data !== "object") throw new Error("Invalid API response format");

        const activeStatus = data.created?.reduce(
          (acc: { [key: string]: boolean }, group: IsusuGroup) => {
            acc[group.id] = group.isActive || false;
            return acc;
          },
          {}
        ) || {};

        // Include joined Isusu groups in active status tracking
        data.joined?.forEach((group: IsusuGroup) => {
          activeStatus[group.id] = group.isActive || false;
        });

        setCreatedIsusus(data.created || []);
        setJoinedIsusus(data.joined || []);
        setActiveGroups(activeStatus);
      } catch (error) {
        console.error("Error fetching Isusu groups:", error);
      }
    };

    fetchIsusuGroups();
    const interval = setInterval(fetchIsusuGroups, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle activation toggle for Isusu group
  const toggleActivation = async (groupId: string) => {
    try {
      const response = await fetch("/api/isusu/activator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      if (!response.ok) throw new Error(`Failed to activate: ${response.statusText}`);

      const data = await response.json();
      if (data?.isActive === undefined) throw new Error("Invalid response from server");

      setActiveGroups((prev) => ({
        ...prev,
        [groupId]: data.isActive,
      }));
    } catch (error) {
      console.error("Error activating group:", error);
    }
  };

    return (
      <div className="p-4 bg-gray-100 min-h-screen">
        {/* Header Buttons */}
        <div className="flex justify-end space-x-4 w-full mt-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard/isusu-purchase/")}
            className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg space-x-2 hover:bg-blue-700"
          >
            <PlusIcon className="w-6 h-6" />
            <span>Create Isusu</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/join-isusu/")}
            className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg space-x-2 hover:bg-green-700"
          >
            <LinkIcon className="w-6 h-6" />
            <span>Join Isusu</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-gray-300">
          <button
            type="button"
            className={`px-6 py-3 font-semibold ${activeTab === "created" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("created")}
          >
            Created Isusu
          </button>
          <button
            type="button"
            className={`px-6 py-3 font-semibold ${activeTab === "joined" ? "border-b-4 border-green-600 text-green-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("joined")}
          >
            Joined Isusu
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {(activeTab === "created" ? createdIsusus : joinedIsusus).length > 0 ? (
            (activeTab === "created" ? createdIsusus : joinedIsusus).map((group) => (
              <div
                key={group.id}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm mx-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xl font-bold text-blue-600">{group.isusuName}</p>

                    {activeTab === "created" && (
                      <>
                        {/* Invite Code */}
                        <button
                          onClick={() => handleCopyCode(group.invite_code, group.id)}
                          className="flex items-center space-x-2 text-xs text-gray-600 hover:text-blue-600 mt-2"
                        >
                          {copiedCode === group.id ? (
                            <>
                              <CheckIcon className="w-5 text-green-500" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <ClipboardIcon className="w-5 text-gray-600" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>

                        {/* Invite Link */}
                        <button
                          onClick={() => handleCopyLink(group.invite_code, group.id)}
                          className="flex items-center space-x-2 text-xs text-gray-600 hover:text-blue-600 mt-2"
                        >
                          {copiedInvite === group.id ? (
                            <>
                              <CheckIcon className="w-5 text-green-500" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <ClipboardIcon className="w-5 text-gray-600" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  <Link href={`/dashboard/isusu-dashboard/${group.id}`} className="flex items-center space-x-2">
                    <span>Members: {Array.isArray(group.members) ? group.members.length : group.members ?? 0}</span>
                    <EyeIcon className="w-5 text-gray-600" />
                  </Link>
                </div>

                <p className="text-lg font-semibold text-black mb-4 text-center">{group.isusuClass}</p>

                <div className="flex justify-between">
                  <p className="text-gray-700"><strong>Frequency:</strong> {group.frequency}</p>
                  <p className="text-gray-700"><strong>Milestone:</strong> ₦{group.milestone}</p>
                </div>

                {/* Activation Button (Only for Created Isusu) */}
                {activeTab === "created" ? (
                  <button
                    type="button"
                    onClick={() => toggleActivation(group.id)}
                    className={`mt-4 w-full py-2 rounded-lg text-white transition ${activeGroups[group.id] ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"
                      }`}
                  >
                    {activeGroups[group.id] ? "Activated" : "Activate"}
                  </button>
                ) : (
                  activeGroups[group.id] && (
                    <p className="mt-4 text-center text-green-600 font-bold">Activated</p>
                  )
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full">
              No {activeTab === "created" ? "created" : "joined"} Isusu groups yet...
            </p>
          )}
        </div>


      </div>
    );
};

export default ManageIsusu;
