// pages/api/webhook.js
import { db } from "../../lib/db";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const secret = process.env.PAYSTACK_SECRET;
  const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(req.body)).digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const { event, data } = req.body;

  if (event === "charge.success") {
    const { amount, reference, metadata } = data;
    const userId = metadata.userId;

    try {
      // Update transaction as successful
      await db.query(
        "UPDATE transactions SET status = 'successful' WHERE reference = $1",
        [reference]
      );

      // Add funds to wallet balance
      await db.query(
        "UPDATE users SET balance = balance + $1 WHERE id = $2",
        [amount / 100, userId]
      );

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(200).json({ success: true });
  }
}
