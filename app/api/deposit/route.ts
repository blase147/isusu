import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email: session.user.email, amount: amount * 100 }),
  });

  const data = await response.json();
  if (!data.status) return res.status(400).json({ error: "Payment initialization failed" });

  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      amount,
      type: "deposit",
      status: "pending",
      reference: data.data.reference,
    },
  });

  res.json({ payment_url: data.data.authorization_url });
}
