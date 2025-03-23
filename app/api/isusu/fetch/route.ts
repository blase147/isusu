import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import tiers from "./../../../lib/utils";

const prisma = new PrismaClient();
const cloudinaryBaseUrl = "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/";

const tierMap = new Map(tiers.map((tier) => [tier.name.toLowerCase(), tier]));

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, profilePicture: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profilePictureUrl = user.profilePicture
      ? `${cloudinaryBaseUrl}w_200,h_200,c_fill/${user.profilePicture}`
      : null;

    // Fetch all Isusus (both created and joined)
    const isusus = await prisma.isusu.findMany({
      where: {
        OR: [
          { createdById: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        members: { select: { userId: true } },
        admins: { select: { id: true } }, // ✅ Fetch admin IDs correctly
      },
    });

    if (!isusus.length) {
      return NextResponse.json(
        { profilePicture: profilePictureUrl, created: [], joined: [] },
        { status: 200 }
      );
    }

    // Process and apply tier settings
    const processedIsusus = isusus.map((isusu) => {
      const tierName = isusu.tier?.trim().toLowerCase() || "tier 1";
      const tierConfig = tierMap.get(tierName) || {};

      // Extract admin IDs from the `admins` array
      const adminIds = isusu.admins.map((admin) => admin.id);
      const allAdmins = new Set([isusu.createdById, ...adminIds]);

      return {
        ...isusu,
        memberCount: isusu.members.length,
        settings: tierConfig,
        admins: Array.from(allAdmins), // Convert Set back to array
        isAdmin: allAdmins.has(user.id), // ✅ User has admin access if in the admin list
        adminButtons: allAdmins.has(user.id) ? ["edit", "delete", "manage members"] : [], // ✅ Buttons accessible only to admins
      };
    });

    // Split into "created" and "joined"
    const createdIsusus = processedIsusus.filter((isusu) => isusu.createdById === user.id);
    const joinedIsusus = processedIsusus.filter((isusu) => isusu.createdById !== user.id);

    return NextResponse.json(
      { profilePicture: profilePictureUrl, created: createdIsusus, joined: joinedIsusus },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user Isusus:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
