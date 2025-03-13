import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { groupId, content, mediaUrl } = await req.json();

    if (!groupId || !content) {
      return NextResponse.json({ error: "Group ID and content are required" }, { status: 400 });
    }

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "User is not a member of this group" }, { status: 403 });
    }

    const newPost = await prisma.post.create({
      data: {
        content,
        mediaUrl,
        groupId,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Post created successfully", post: newPost }, { status: 201 });
  } catch (error) {
    console.error("⛔ Error creating post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
