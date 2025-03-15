"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "../button";
import Image from "next/image";

const CreatePost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Generate previews for images
    const previews = selectedFiles
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));

    setPreviewUrls(previews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("isusuId", id as string);
      formData.append("title", title);
      formData.append("content", content);

      // Append all selected files
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/isusu/create-post", {
        method: "POST",
        body: formData, // Send as FormData, NOT JSON
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      setSuccess("Post created successfully!");
      setTitle("");
      setContent("");
      setFiles([]);
      setPreviewUrls([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">📝 Create a New Post</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />

        <textarea
          placeholder="Write your post here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full p-2 border rounded h-32"
        ></textarea>

        {/* File Upload */}
        <label className="block">
          <span className="sr-only">Upload files</span>
          <input
            type="file"
            multiple
            accept="image/*, audio/*, application/pdf"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
        </label>

        {/* Image Previews */}
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {previewUrls.map((url, index) => (
              <Image key={index} src={url} alt="Preview" width={80} height={80} className="object-cover rounded" />
            ))}
          </div>
        )}

        <Button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          {loading ? "Posting..." : "Post"}
        </Button>
      </form>
    </div>
  );
};

export default CreatePost;
