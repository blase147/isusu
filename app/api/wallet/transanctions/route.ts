import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"; // Ensure you're using the singleton instance

const prisma = new PrismaClient();
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { email, amount } = await req.json();
    if (!session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const senderId = session.user.id; // Extracted from auth session

    if (!email || !amount || amount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
    }

    // Find sender and recipient
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      include: { wallet: true },
    });

    const recipient = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!sender || !recipient) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (!sender.wallet || sender.wallet.balance < amount) {
      return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 });
    }

    // Perform the transaction
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: sender.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.wallet.update({
        where: { userId: recipient.id },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          senderId: sender.id,
          recipientId: recipient.id,
          amount,
          type: "TRANSFER",
          status: "SUCCESS",
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Money sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
