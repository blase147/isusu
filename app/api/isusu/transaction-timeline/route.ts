import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // Fetch transactions from the database with optional filtering
    const transactions = await prisma.transaction.findMany({
      where: type ? { type } : {},
      orderBy: { createdAt: "desc" }, // Sort by newest first
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        transactions: transactions.map((tx) => ({
          id: tx.id,
          amount: tx.amount,
          type: tx.type,
          status: tx.status,
          createdAt: tx.createdAt,
          reference: tx.reference,
          description: tx.description ?? "No description provided", // ✅ Ensure description is included
          sender: tx.sender,
          recipient: tx.recipient,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
