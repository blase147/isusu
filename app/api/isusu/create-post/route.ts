import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary"; // Install: npm install cloudinary

const prisma = new PrismaClient();

// Configure Cloudinary (Replace with your credentials)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // ✅ Parse FormData
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const isusuId = formData.get("isusuId") as string;
    const content = formData.get("content") as string;
    const mediaFiles = formData.getAll("files") as File[];

    if (!isusuId || !content) {
      return NextResponse.json({ error: "Isusu ID and content are required" }, { status: 400 });
    }

    // ✅ Ensure user is a member of the isusu group
    const membership = await prisma.isusuMembers.findFirst({
      where: { isusuId, userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "User is not a member of this group" }, { status: 403 });
    }

    // ✅ Handle media uploads to Cloudinary
    const mediaUrls: string[] = [];

    for (const file of mediaFiles) {
      const buffer = await file.arrayBuffer();
      const base64File = Buffer.from(buffer).toString("base64");
      const dataUri = `data:${file.type};base64,${base64File}`;

      const uploadResponse = await cloudinary.uploader.upload(dataUri, {
        folder: "isusu_posts",
      });

      mediaUrls.push(uploadResponse.secure_url);
    }

    // ✅ Create new post
    const newPost = await prisma.post.create({
      data: {
        content,
        title,
        mediaUrl: mediaUrls.length > 0 ? mediaUrls.join(",") : null,
        isusuId,
        userId: user.id,
      },
    });

    // ✅ Fetch all group members (excluding the sender)
    const groupMembers = await prisma.isusuMembers.findMany({
      where: { isusuId, NOT: { userId: user.id } },
      select: { userId: true },
    });

    // ✅ Create notifications for all members
    interface Notification {
      userId: string;
      isusuId: string;
      type: string;
      message: string;
    }

    interface GroupMember {
      userId: string;
    }

    interface Notification {
      userId: string;
      isusuId: string;
      type: string;
      message: string;
    }

    const notifications: Notification[] = groupMembers.map((member: GroupMember): Notification => ({
      userId: member.userId,
      isusuId,
      type: "new_post",
      message: `New post in your Isusu group`,
    }));

    await prisma.notification.createMany({ data: notifications });

    return NextResponse.json({ message: "Post created & notifications sent", post: newPost }, { status: 201 });
  } catch (error) {
    console.error("⛔ Error creating post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
