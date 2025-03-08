import { NextApiRequest, NextApiResponse } from "next";

// Dummy data (Replace with database query)
const leaderboardData: { [key: string]: { name: string; contributions: number; }[] } = {
  "1674271e-1ce9-42bb-990d-2dce1ba33ea6": [
    { name: "John Doe", contributions: 500 },
    { name: "Jane Smith", contributions: 450 },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { isusuId } = req.query;

  if (!isusuId || typeof isusuId !== "string") {
    return res.status(400).json({ error: "Invalid Isusu ID" });
  }

  const leaderboard = leaderboardData[isusuId] || [];
  return res.status(200).json({ leaderboard });
}
