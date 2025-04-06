import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 Processing withdrawal request");

    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    const { amount: amountStr, bankName, bankCode, accountNumber, groupId, isIsusuGroup = false } = await req.json();
    const amount = parseFloat(amountStr);

    if (!amount || isNaN(amount) || amount <= 0 || !bankName || !bankCode || !accountNumber || (isIsusuGroup && !groupId)) {
      return NextResponse.json({ error: "Invalid or missing required fields" }, { status: 400 });
    }

    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, walletId: true, name: true },
    });

    if (!user || !user.walletId) {
      return NextResponse.json({ error: "User wallet not found" }, { status: 404 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { id: user.walletId },
      select: { id: true, balance: true },
    });

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    console.log("💰 Initiating withdrawal:", { amount, bankName, bankCode, accountNumber });

    const recipientResponse = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
      body: JSON.stringify({
        type: "nuban",
        name: bankName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      }),
    });

    const recipientData = await recipientResponse.json();
    if (!recipientData.status || !recipientData.data?.recipient_code) {
      console.error("❌ Recipient Creation Failed:", recipientData);
      return NextResponse.json({ error: "Failed to create transfer recipient" }, { status: 400 });
    }

    const recipientCode = recipientData.data.recipient_code;
    console.log("✅ Recipient created:", recipientCode);

    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
      body: JSON.stringify({
        source: "balance",
        amount: amount * 100, // Convert to kobo
        recipient: recipientCode,
        reason: "Wallet Withdrawal",
      }),
    });

    const transferData = await transferResponse.json();
    if (!transferData.status) {
      console.error("❌ Transfer Failed:", transferData);
      return NextResponse.json({ error: transferData.message || "Withdrawal failed" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.transaction.create({
        data: {
          senderId: user.id,
          amount,
          type: "WITHDRAWAL",
          status: "SUCCESS",
          reference: transferData.data.reference,
          description: `Withdrawal from ${user.name || (isIsusuGroup ? "Isusu Group" : "Unknown")}`,
        },
      }),
    ]);

    console.log("✅ Withdrawal successful:", transferData);
    return NextResponse.json({ success: true, message: "Withdrawal successful", data: transferData.data }, { status: 200 });
  } catch (error) {
    console.error("🚨 Withdrawal Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
