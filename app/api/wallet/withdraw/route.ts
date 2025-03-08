import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { amount, bankCode, accountNumber } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });
  if (!wallet || wallet.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

  const response = await fetch("https://api.paystack.co/transferrecipient", {
    method: "POST",
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "nuban", name: session.user.name, bank_code: bankCode, account_number: accountNumber }),
  });

  const data = await response.json();
  if (!data.status) return res.status(400).json({ error: "Bank transfer failed" });

  await prisma.$transaction([
    prisma.wallet.update({ where: { userId: session.user.id }, data: { balance: { decrement: amount } } }),
    prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "withdrawal",
        status: "completed",
        reference: data.data.recipient_code,
      },
    }),
  ]);

  res.json({ message: "Withdrawal successful" });
}
