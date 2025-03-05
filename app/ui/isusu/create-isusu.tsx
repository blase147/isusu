"use client";

import { BackwardIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import Link from "next/link";

const CreateIsusu = () => {
  const [isusuName, setIsusuName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [milestone, setMilestone] = useState("");
  const [isusuClass, setIsusuClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/isusu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isusuName, frequency, milestone, isusuClass }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Isusu group");
      }

      await response.json();
      alert("Isusu group created successfully!");
      setIsusuName("");
      setFrequency("");
      setMilestone("");
      setIsusuClass("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Link href="/dashboard/manage-isusu" className="flex items-center justify-center  mb-4">
        <BackwardIcon className="m-2 w-6 h-6 text-blue-600 cursor-pointer" />
        <span>Go Back</span>
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Create Isusu Group
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Isusu Name</label>
            <input
              type="text"
              className="w-full border p-2 rounded-md mt-1"
              placeholder="Enter group name"
              value={isusuName}
              onChange={(e) => setIsusuName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Class of Isusu</label>
            <select
              title="Class of Isusu"
              className="w-full border p-2 rounded-md mt-1"
              value={isusuClass}
              onChange={(e) => setIsusuClass(e.target.value)}
              required
            >
              <option value="">Select Isusu Class</option>
              <option value="EveryDay Market">EveryDay Market</option>
              <option value="Weekend Oringo">Weekend Oringo</option>
              <option value="Uwamgbede">Uwamgbede</option>
              <option value="PayDay Flex">PayDay Flex</option>
              <option value="Quarter Merchants">Weekly Club Merchants</option>
              <option value="Annual Grocery Merchants">Annual Grocery Merchants</option>
              <option value="Chosen takes it all">Chosen takes it all</option>
            </select>
          </div>

          <div>
            <label htmlFor="frequency" className="block font-semibold">Frequency</label>
            <select
              id="frequency"
              className="w-full border p-2 rounded-md mt-1"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              required
            >
              <option value="">Select frequency</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annually">Annually</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">Milestone Amount</label>
            <input
              type="number"
              className="w-full border p-2 rounded-md mt-1"
              placeholder="Enter target amount"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-md font-semibold mt-4"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Isusu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateIsusu;
