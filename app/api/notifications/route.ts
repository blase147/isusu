import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Import authentication function

const prisma = new PrismaClient();

// 📌 GET /api/notifications - Fetch notifications for the authenticated user
export async function GET() {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // Get user ID from the authenticated session
    console.log("Fetching notifications for authenticated userId:", userId);

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { user: true, isusu: true },
    });

    console.log("Fetched notifications:", notifications); // Debugging log

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
