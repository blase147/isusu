import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
  });

  if (!wallet) return res.status(404).json({ error: "Wallet not found" });

  res.json({ balance: wallet.balance });
}
