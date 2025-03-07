import { NextApiRequest, NextApiResponse } from "next";

// Dummy data (Replace with database query)
const activitiesData: { [key: string]: { id: string; description: string }[] } = {
  "1674271e-1ce9-42bb-990d-2dce1ba33ea6": [
    { id: "1", description: "John contributed $50" },
    { id: "2", description: "Jane withdrew $100" },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { isusuId } = req.query;

  if (!isusuId || typeof isusuId !== "string") {
    return res.status(400).json({ error: "Invalid Isusu ID" });
  }

  const activities = activitiesData[isusuId] || [];
  return res.status(200).json({ activities });
}
