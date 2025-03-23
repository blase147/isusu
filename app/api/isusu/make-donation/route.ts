import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    console.log("🔍 Received request to send donation");

    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, walletId: true },
    });

    if (!user || !user.walletId) {
      return NextResponse.json({ error: "wallet_not_found" }, { status: 404 });
    }

    const body = await req.json();
    const { amount: amountStr, isusuId, description } = body;

    // Ensure `amount` is converted to a number
    const amount = parseFloat(amountStr);

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    if (!isusuId) {
      return NextResponse.json({ error: "group_id_required" }, { status: 400 });
    }

    // Fetch sender's wallet
    const senderWallet = await prisma.wallet.findUnique({
      where: { id: user.walletId },
      select: { id: true, balance: true },
    });

    if (!senderWallet || senderWallet.balance < amount) {
      return NextResponse.json({ error: "insufficient_funds" }, { status: 400 });
    }

    // Fetch Isusu group wallet & owner
    const isusu = await prisma.isusu.findUnique({
      where: { id: isusuId },
      select: { walletId: true, createdById: true },
    });

    if (!isusu || !isusu.walletId) {
      return NextResponse.json({ error: "group_wallet_not_found" }, { status: 404 });
    }

    const recipientWallet = await prisma.wallet.findUnique({
      where: { id: isusu.walletId },
      select: { id: true, balance: true },
    });

    if (!recipientWallet) {
      return NextResponse.json({ error: "recipient_wallet_not_found" }, { status: 404 });
    }

    // Process transaction and create a notification
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
      prisma.notification.create({
        data: {
          userId: isusu.createdById, // Notify the Isusu group owner
          type: "donation",
          message: `${user.name} has donated ₦${amount} to your Isusu group.`,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({ message: "donation_successful" }, { status: 200 });
  } catch (error) {
    console.error("Error processing donation:", error);
    return NextResponse.json({ error: "donation_failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
