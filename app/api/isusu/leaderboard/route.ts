import { NextResponse } from "next/server";

// Dummy data (Replace with database query)
const leaderboardData: Record<string, { name: string; contributions: number }[]> = {
  "1674271e-1ce9-42bb-990d-2dce1ba33ea6": [
    { name: "John Doe", contributions: 500 },
    { name: "Jane Smith", contributions: 450 },
  ],
};

// Next.js App Router API format
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isusuId = searchParams.get("isusuId");

  if (!isusuId) {
    return NextResponse.json({ error: "Invalid Isusu ID" }, { status: 400 });
  }

  const leaderboard = leaderboardData[isusuId] || [];
  return NextResponse.json({ leaderboard }, { status: 200 });
}
