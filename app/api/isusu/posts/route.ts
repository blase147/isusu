import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // ✅ Authenticate user
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

    // ✅ Extract isusuId from query parameters
    const url = new URL(req.url);
    const isusuId = url.searchParams.get("isusuId");

    if (!isusuId) {
      return NextResponse.json({ error: "Isusu ID is required" }, { status: 400 });
    }

    // ✅ Check if user is a member of the isusu group
    const membership = await prisma.isusuMembers.findFirst({
      where: { isusuId, userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "User is not a member of this group" }, { status: 403 });
    }

    // ✅ Fetch posts related to the isusuId
    const posts = await prisma.post.findMany({
      where: { isusuId },
      include: {
        user: {
          select: { name: true, email: true }, // Fetch user details
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts }, { status: 200 });

  } catch (error) {
    console.error("⛔ Error fetching posts:", error);
    return NextResponse.json({ error: "Internal server error", details: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
