"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface PostsProps {
  isusuId: string; // Accept isusuId as a prop
}

export default function Posts({ isusuId }: PostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isusuId) return;

    fetch(`/api/isusu/posts?isusuId=${isusuId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched posts:", data);
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [isusuId]);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Latest Posts</h2>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts available</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id} className="border-b py-4">
              <h3 className="text-lg font-semibold">{post.title || "Untitled Post"}</h3>
              <p className="text-md">{post.content || "No content available"}</p>
              {post.mediaUrl && (
                <Image
                  src={post.mediaUrl}
                  alt="Post Media"
                  className="mt-2 rounded-md w-full max-h-64 object-cover"
                  width={500}
                  height={500}
                  priority
                />
              )}
              <p className="text-sm text-gray-500">
                Posted by: {post.user?.name || "Unknown"} ({post.user?.email || "No email"})
              </p>
              <p className="text-xs text-gray-400">
                Created: {post.createdAt ? new Date(post.createdAt).toLocaleString() : "Unknown date"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
