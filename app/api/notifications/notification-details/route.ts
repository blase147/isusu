import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Assuming you have authentication middleware

const prisma = new PrismaClient();

// 📌 GET /api/notifications/notification-details?id={id} - Fetch notification details by ID
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = String(session.user.id);

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: true, isusu: true }, // Add other relations as needed
    });

    if (!notification || notification.userId !== userId) {
      return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error fetching notification details:", error);
    return NextResponse.json({ error: "Failed to fetch notification details" }, { status: 500 });
  }
}
