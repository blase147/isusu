"use client";

import React, { useState, useRef, useEffect } from "react";
import { CameraIcon } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface User {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  biography?: string;
  bankAccount?: string;
  occupation?: string;
  profilePicture?: string;
}

const EditProfile = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { status } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<User>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    biography: "",
    bankAccount: "",
    occupation: "",
    profilePicture: "/avatar.png",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchUser = async () => {
        try {
          const response = await fetch("/api/user", { method: "GET" });
          if (!response.ok) throw new Error("Failed to fetch user data");

          const data = await response.json();
          setUser(data);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };

      fetchUser();
    }
  }, [status]);

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        ...user,
        profilePicture: user.profilePicture || "/default-avatar.png",
      }));
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];

    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFields: Record<string, string | File> = {};

    // Collect only changed fields
    Object.entries(profile).forEach(([key, value]) => {
      if (user && user[key as keyof User] !== value && key !== "profilePicture") {
        updatedFields[key] = value;
      }
    });

    // Append image file if changed
    if (selectedFile) {
      updatedFields["image"] = selectedFile;
    }

    if (Object.keys(updatedFields).length === 0) {
      alert("No changes detected.");
      return;
    }

    const formData = new FormData();
    Object.entries(updatedFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await fetch("/api/user/user-update", {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
      } else {
        alert(`Update failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Network error. Please try again.");
    }
  };


  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

      {/* Profile Image Upload Section */}
      <div className="flex flex-col items-center mb-4">
        <div
          className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image
            src={profile.profilePicture || "/default-avatar.png"}
            alt="Profile"
            width={128}
            height={128}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
            <CameraIcon className="text-white w-8 h-8" />
          </div>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} title="Upload Profile Picture" />
      </div>

      {/* Profile Form */}
      <form onSubmit={handleUpdate} className="space-y-4">
        {Object.entries(profile).map(
          ([key, value]) =>
            key !== "profilePicture" && (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </label>
                <input
                  type={key === "email" ? "email" : key === "dateOfBirth" ? "date" : "text"}
                  id={key}
                  value={value as string}
                  onChange={(e) => setProfile((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="mt-2 p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
            )
        )}
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-md mt-4 w-full">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
