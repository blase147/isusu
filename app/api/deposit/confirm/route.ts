import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { reference } = req.body;
  if (!reference) return res.status(400).json({ error: "Reference is required" });

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  });

  const data = await response.json();
  if (!data.status) return res.status(400).json({ error: "Payment verification failed" });

  const transaction = await prisma.transaction.findUnique({ where: { reference } });
  if (!transaction || transaction.status !== "pending") return res.status(400).json({ error: "Invalid transaction" });

  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId: transaction.userId },
      data: { balance: { increment: transaction.amount } },
    }),
    prisma.transaction.update({
      where: { reference },
      data: { status: "completed" },
    }),
  ]);

  res.json({ message: "Deposit confirmed" });
}
