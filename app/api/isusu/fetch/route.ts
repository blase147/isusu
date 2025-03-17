import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import tiers from "./../../../lib/utils";

const prisma = new PrismaClient();

// Convert tiers to a Map for quick lookups
interface TierConfig {
  permissions?: {
    admins?: boolean;
  };
}

const tierMap = new Map<string, TierConfig>(tiers.map((tier) => [tier.name.toLowerCase(), tier]));

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
          { createdById: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      select: {
        id: true,
        isusuName: true,
        isusuClass: true,
        frequency: true,
        milestone: true,
        createdById: true,
        invite_code: true,
        isActive: true,
        tier: true, // Fetch tier name
        members: {
          select: {
            userId: true,
          },
        },
      },
    });

    // Apply tier settings
    const processedIsusus = isusus.map((isusu) => {
      const tierName = isusu.tier?.trim().toLowerCase() || "tier 1";
      const tierConfig = tierMap.get(tierName) || {};

      return {
        ...isusu,
        memberCount: isusu.members.length,
        settings: tierConfig,
        admins: [isusu.createdById], // Add admin user ID(s)
      };
    });


    // Split groups into "created" and "joined"
    const createdIsusus = processedIsusus.filter((isusu) => isusu.createdById === user.id);
    const joinedIsusus = processedIsusus.filter((isusu) => isusu.createdById !== user.id);

    return NextResponse.json({ created: createdIsusus, joined: joinedIsusus }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user Isusus:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
