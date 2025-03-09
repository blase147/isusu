// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

//   const { reference } = req.body;
//   if (!reference) return res.status(400).json({ error: "Reference is required" });

//   const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
//     headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
//   });

//   const data = await response.json();
//   if (!data.status) return res.status(400).json({ error: "Payment verification failed" });

//   const transaction = await prisma.transaction.findFirst({ where: { reference: reference } });
//   if (!transaction || transaction.status !== "pending") return res.status(400).json({ error: "Invalid transaction" });

//   await prisma.$transaction([
//     prisma.wallet.update({
//       where: { userId: transaction.senderId },
//       data: { balance: { increment: transaction.amount } },
//     }),
//     prisma.transaction.update({
//       where: { id: transaction.id },
//       data: { status: "completed" },
//     }),
//   ]);

//   res.json({ message: "Deposit confirmed" });
// }
