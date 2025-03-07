import { NextApiRequest, NextApiResponse } from "next";

// Dummy data (Replace with database query)
type MembersData = {
  [key: string]: { id: string; name: string; email: string }[];
};

const membersData: MembersData = {
  "1674271e-1ce9-42bb-990d-2dce1ba33ea6": [
    { id: "1", name: "John Doe", email: "john@example.com" },
    { id: "2", name: "Jane Smith", email: "jane@example.com" },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { isusuId } = req.query;

  if (!isusuId || typeof isusuId !== "string") {
    return res.status(400).json({ error: "Invalid Isusu ID" });
  }

  const members = membersData[isusuId] || [];
  return res.status(200).json({ members });
}
