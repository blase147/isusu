import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"; // Use a singleton Prisma instance

const prisma = new PrismaClient();
import { auth } from "@/auth";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Parse request body
    const { amount, bankCode, accountNumber, email } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Check if email is provided
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user wallet using email instead of userId
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user || !user.wallet || user.wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance or user not found" }, { status: 400 });
    }

    // Create Paystack transfer recipient
    const response = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: user.name,
        bank_code: bankCode,
        account_number: accountNumber,
      }),
    });

    const data = await response.json();
    if (!data.status) {
      return NextResponse.json({ error: "Bank transfer failed" }, { status: 400 });
    }

    // Perform database transactions
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.transaction.create({
        data: {
          amount,
          type: "withdrawal",
          status: "completed",
          reference: data.data.recipient_code,
          sender: { connect: { id: user.id } },
          recipient: {
            connectOrCreate: {
              where: { id: data.data.recipient_code },
              create: {
                id: data.data.recipient_code,
                email: user.email,
                password: "defaultPassword" // Replace with a secure default password or handle appropriately
              }
            }
          },
        },
      }),
    ]);

    return NextResponse.json({ message: "Withdrawal successful" }, { status: 200 });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
