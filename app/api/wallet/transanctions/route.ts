// pages/api/wallet/transactions.js
import { db } from "../../../lib/db"; // Your database connection

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const userId = req.query.userId; // Get user ID from request

    const transactions = await db.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.status(200).json(transactions.rows);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
