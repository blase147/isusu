import { NextResponse } from "next/server";

// Dummy data (Replace with database query)
const leaderboardData = [
  { name: "John Doe", contributions: 500 },
  { name: "Jane Smith", contributions: 450 },
];

// GET request handler for leaderboard
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isusuId = searchParams.get("isusuId");

  if (isusuId) {
    const index = parseInt(isusuId);
    if (isNaN(index) || index < 0 || index >= leaderboardData.length) {
      return NextResponse.json({ error: "Invalid Isusu ID" }, { status: 400 });
    }
    return NextResponse.json({ leaderboard: [leaderboardData[index]] }, { status: 200 });
  }

  // Return all data if no isusuId is provided
  return NextResponse.json({ leaderboard: leaderboardData }, { status: 200 });
}
