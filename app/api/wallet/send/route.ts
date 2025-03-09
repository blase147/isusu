import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Use auth() instead of getServerSession

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    console.log("🔍 Received request to send money");

    // Get authenticated session
    const session = await auth();
    if (!session || !session.user?.email) {
      console.error("❌ Unauthorized request: No valid session found");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const senderEmail = session.user.email.toLowerCase();
    const { recipientEmail, amount } = await req.json();
    console.log("📩 Parsed Request Data:", { recipientEmail, amount });

    // Validate inputs
    if (!recipientEmail || typeof recipientEmail !== "string") {
      console.error("⚠️ Invalid recipient email");
      return NextResponse.json(
        { success: false, message: "Invalid recipient email" },
        { status: 400 }
      );
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error("⚠️ Invalid amount:", amount);
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    const recipientEmailLower = recipientEmail.toLowerCase();

    console.log("🔍 Searching for sender in the database...");
    const sender = await prisma.user.findUnique({
      where: { email: senderEmail },
      include: { wallet: true },
    });

    if (!sender || !sender.wallet) {
      console.error("❌ Sender not found or has no wallet:", senderEmail);
      return NextResponse.json(
        { success: false, message: "Sender not found or has no wallet" },
        { status: 404 }
      );
    }

    console.log("🔍 Searching for recipient in the database...");
    let recipient = await prisma.user.findUnique({
      where: { email: recipientEmailLower },
      include: { wallet: true },
    });

    if (!recipient) {
      console.error("❌ Recipient not found, creating user and wallet...");
      recipient = await prisma.user.create({
        data: {
          email: recipientEmailLower,
          wallet: { create: { balance: 0 } },
        },
        include: { wallet: true },
      });
    } else if (!recipient.wallet) {
      console.error("❌ Recipient found but has no wallet, creating wallet...");
      recipient.wallet = await prisma.wallet.create({
        data: { userId: recipient.id, balance: 0 },
      });
    }

    console.log("💰 Checking sender's balance...");
    if (sender.wallet.balance < amount) {
      console.error("❌ Insufficient balance:", sender.wallet.balance);
      return NextResponse.json(
        { success: false, message: "Insufficient balance" },
        { status: 400 }
      );
    }

    console.log("🔄 Processing transaction...");
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: sender.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.wallet.update({
        where: { userId: recipient.id },
        data: { balance: { increment: amount } },
      }),
    ]);

    console.log("✅ Transaction successfully completed!");
    return NextResponse.json({ success: true, message: "Transfer successful" });
  } catch (error) {
    console.error("🚨 Error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 }
    );
  }
}
