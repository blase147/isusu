import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Extract `isusuId` from request URL
    const url = new URL(req.url);
    const isusuId = url.searchParams.get("isusuId");

    if (!isusuId) {
      return NextResponse.json({ error: "No Isusu ID provided. Please check the URL." }, { status: 400 });
    }

    // Fetch Isusu group with both members and admins
    const isusuGroup = await prisma.isusu.findUnique({
      where: { id: isusuId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        admins: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!isusuGroup) {
      return NextResponse.json({ error: "Isusu group not found" }, { status: 404 });
    }

    // Extract admin IDs for quick lookup
    const adminIds = new Set(isusuGroup.admins.map((admin) => admin.id));

    // Format members list and check admin status
    const membersWithAdminStatus = isusuGroup.members.map((member) => ({
      id: member.user.id,
      name: member.user.name || "Unknown",
      email: member.user.email,
      isAdmin: adminIds.has(member.user.id), // Check if the user is an admin
    }));

    return NextResponse.json({
      isusuName: isusuGroup.isusuName,
      members: membersWithAdminStatus,
    });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
