import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient(); // Initialize Prisma client

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { reference, amount } = await req.json();
    const secretKey = process.env.PAYSTACK_SECRET_KEY || "";

    // Verify transaction with Paystack API
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!data.status || data.data.status !== "success") {
      return NextResponse.json({ success: false, message: "Payment verification failed" });
    }

    // Get logged-in user from session
    const email = session.user.email as string;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true }, // Ensure wallet is included
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Ensure user has a wallet, else create one
    if (!user.wallet) {
      await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: amount,
        },
      });
    } else {
      // Update wallet balance
      await prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { increment: amount } }, // Add deposit amount
      });
    }

    return NextResponse.json({ success: true, message: "Wallet funded successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
