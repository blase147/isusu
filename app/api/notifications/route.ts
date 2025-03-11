import { NextResponse } from "next/server";

// Dummy notifications data (Replace with database query)
const notifications = [
  { id: "1", message: "New message from John Doe", type: "message", timestamp: "2025-03-11T10:30:00Z" },
  { id: "2", message: "Your payment was successful!", type: "payment", timestamp: "2025-03-10T08:15:00Z" },
  { id: "3", message: "System update scheduled for tomorrow", type: "system", timestamp: "2025-03-09T12:00:00Z" },
];

// GET request handler for fetching notifications
export async function GET() {
  try {
    return NextResponse.json({ notifications }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
