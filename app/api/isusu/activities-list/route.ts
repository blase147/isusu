import { NextRequest, NextResponse } from "next/server";

// Dummy activities data mapped by isusuId
const activitiesData: { [key: string]: { id: string; description: string; timestamp: string }[] } = {
  "123": [
    { id: "1", description: "John Doe contributed $100", timestamp: "2024-03-07T12:00:00Z" },
    { id: "2", description: "Jane Smith withdrew $50", timestamp: "2024-03-07T14:30:00Z" },
  ],
  "456": [
    { id: "3", description: "Alex Johnson joined the Isusu", timestamp: "2024-03-06T10:15:00Z" },
  ],
};

// ✅ Correct way to export for GET requests
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const isusuId = url.searchParams.get("isusuId");

  if (!isusuId) {
    return NextResponse.json({ error: "Missing isusuId parameter" }, { status: 400 });
  }

  console.log(`📌 Serving activities for isusuId: ${isusuId}`);

  const activities = activitiesData[isusuId] || [];
  return NextResponse.json({ activities }, { status: 200 });
}
