import { NextResponse } from "next/server";

// Dummy posts data (Replace with database query)
const posts = [
  { id: "1", title: "Next.js 14 is Here!", content: "Learn about the latest features in Next.js 14." },
  { id: "2", title: "React Server Components", content: "A deep dive into React Server Components and their benefits." },
  { id: "3", title: "TypeScript for Beginners", content: "Start learning TypeScript with this beginner-friendly guide." },
];

// GET request handler for fetching posts
export async function GET() {
  try {
    return NextResponse.json({ posts }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
