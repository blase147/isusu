"use client";

import { BackwardIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation"; // ✅ updated import


interface InitialData {
  isusuName: string;
  milestone: number;
  frequency: string;
  isusuClass: string;
  groupImage?: string;
}

const IsusuUpdate = () => {
  const router = useRouter();
  const { id: isusuId } = useParams();

  const [isusuName, setIsusuName] = useState<string>("");
  const [milestone, setMilestone] = useState<number | string>("");
  const [frequency, setFrequency] = useState<string>("");
  const [isusuClass, setIsusuClass] = useState<string>("");
  const [groupImage, setGroupImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isusuClasses = [
    { label: "Weekend Oringo", value: "Weekend Oringo", frequencies: ["Daily", "Weekly"] },
    { label: "Uwamgbede", value: "Uwamgbede", frequencies: ["Daily", "Weekly", "Biweekly"] },
    { label: "Payday Flex", value: "Payday Flex", frequencies: ["Daily", "Weekly", "Biweekly", "Monthly"] },
    { label: "Chief Merchants", value: "Chief Merchants", frequencies: ["Daily", "Weekly", "Biweekly", "Monthly", "Third Quarterly"] },
    { label: "Doublers Arena", value: "Mid Year Takers", frequencies: ["Daily", "Weekly", "Biweekly", "Monthly", "Third Quarterly", "Semi-Annually"] },
    { label: "Party Mongers", value: "Party Mongers", frequencies: ["Daily", "Weekly", "Biweekly", "Monthly", "Third Quarterly", "Semi-Annually", "Annually"] },
  ];

  useEffect(() => {
    if (!isusuId) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/isusu/update/${isusuId}`);
        if (!response.ok) throw new Error("Failed to fetch Isusu data.");
        const data: InitialData = await response.json();

        setIsusuName(data.isusuName);
        setMilestone(data.milestone);
        setFrequency(data.frequency);
        setIsusuClass(data.isusuClass);
        if (data.groupImage) {
          setGroupImage(new File([], data.groupImage)); // This line assumes the string is a filename, but may not work
        }
      } catch {
        setError("Failed to load data.");
      }
    };

    fetchData();
  }, [isusuId]);




  const handleIsusuClassChange = (value: string) => {
    setIsusuClass(value);
    setFrequency("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupImage(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Isusu ID from URL params:", isusuId);
      if (!isusuId) {
        setError("Invalid Isusu ID.");
        return;
      }

      const formData = new FormData();
      formData.append("isusuName", isusuName);
      formData.append("frequency", frequency);
      formData.append("milestone", String(milestone));
      formData.append("isusuClass", isusuClass);
      if (groupImage) formData.append("groupImage", groupImage);

      const response = await fetch(`/api/isusu/update/${isusuId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update Isusu group.");
      alert("Isusu updated successfully!");
      router.push("/dashboard/manage-isusu");
    } catch {
      setError("Failed to update Isusu group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Link href="/dashboard/manage-isusu" className="flex items-center justify-center mb-4">
        <BackwardIcon className="m-2 w-6 h-6 text-blue-600 cursor-pointer" />
        <span>Go Back</span>
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Update Isusu Group</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block font-semibold">Isusu Name</label>
            <input
              title="Isusu Name"
              type="text"
              className="w-full border p-2 rounded-md mt-1"
              value={isusuName}
              onChange={(e) => setIsusuName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Group Image</label>
            <input
              type="file"
              className="w-full border p-2 rounded-md mt-1"
              accept="image/*"
              onChange={handleFileChange}
              title="Upload a group image"
            />
          </div>

          <div>
            <label className="block font-semibold">Class of Isusu</label>
            <select
              title="Select Isusu Class"
              className="w-full border p-2 rounded-md mt-1"
              value={isusuClass}
              onChange={(e) => handleIsusuClassChange(e.target.value)}
              required
            >
              <option value="" disabled>Select an Isusu Class</option>
              {isusuClasses.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Milestone</label>
            <select
              className="w-full border p-2 rounded-md mt-1"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              required
              disabled={!isusuClass}
              title="Milestone selection dropdown"
            >
              <option value="" disabled>Select Milestone</option>
              {isusuClasses.find(({ value }) => value === isusuClass)?.frequencies.map((freq) => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Contribution Amount</label>
            <input
              type="number"
              className="w-full border p-2 rounded-md mt-1"
              placeholder="Enter target amount"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value ? Number(e.target.value) : "")}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 px-4 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Isusu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IsusuUpdate;
