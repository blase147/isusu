import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
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

    // Fetch all Isusu groups the user is involved in
    const isusus = await prisma.isusu.findMany({
      where: {
        OR: [
          { createdById: user.id }, // Groups created by user
          { members: { some: { userId: user.id } } }, // Groups joined by user
        ],
      },
      select: {
        id: true,
        isusuName: true,
        isusuClass: true,
        frequency: true,
        milestone: true,
        createdById: true,
        invite_code: true, // Ensure invite_code is included
        members: {
          select: {
            userId: true, // Fetch user IDs of members
          },
        },
      },
    });

    // Split groups into "created" and "joined"
    const createdIsusus = isusus
      .filter((isusu) => isusu.createdById === user.id)
      .map((isusu) => ({
        ...isusu,
        memberCount: isusu.members.length, // Count members
      }));

    const joinedIsusus = isusus
      .filter((isusu) => isusu.createdById !== user.id)
      .map((isusu) => ({
        ...isusu,
        memberCount: isusu.members.length, // Count members
      }));

    return NextResponse.json({ created: createdIsusus, joined: joinedIsusus }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user Isusus:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
