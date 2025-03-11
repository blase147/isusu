import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    console.log("🔍 Received request to send money");

    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, walletId: true },
    });

    if (!user || !user.walletId) {
      return NextResponse.json({ error: "User wallet not found" }, { status: 404 });
    }

    const body = await req.json();
    const { amount: amountStr, isusuId, description } = body;

    // Ensure `amount` is converted to a number
    const amount = parseFloat(amountStr);

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    if (!isusuId) {
      return NextResponse.json(
        { error: "Group ID is required." },
        { status: 400 }
      );
    }

    // Fetch sender's wallet
    const senderWallet = await prisma.wallet.findUnique({
      where: { id: user.walletId },
      select: { id: true, balance: true },
    });

    if (!senderWallet || senderWallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    // Fetch Isusu group wallet
    const isusu = await prisma.isusu.findUnique({
      where: { id: isusuId },
      select: { walletId: true, createdById: true },
    });

    if (!isusu || !isusu.walletId) {
      return NextResponse.json(
        { error: "Group wallet not found" },
        { status: 404 }
      );
    }

    const recipientWallet = await prisma.wallet.findUnique({
      where: { id: isusu.walletId },
      select: { id: true, balance: true },
    });

    if (!recipientWallet) {
      return NextResponse.json(
        { error: "Recipient wallet not found" },
        { status: 404 }
      );
    }

    // Process transaction
    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.wallet.update({
        where: { id: recipientWallet.id },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          senderId: user.id,
          recipientId: isusu.createdById, // The user who created the Isusu group
          amount,
          type: "donation",
          status: "completed",
          reference: `txn_${Date.now()}`,
          description: description || "Isusu group contribution",
        },
      }),
    ]);

    return NextResponse.json({ message: "Donation successful" }, { status: 200 });
  } catch (error) {
    console.error("Error processing donation:", error);
    return NextResponse.json(
      { error: "Failed to process donation" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
