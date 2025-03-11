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
    if (!reference || !amount) {
      return NextResponse.json({ success: false, message: "Missing transaction reference or amount" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY || "";
    if (!secretKey) {
      return NextResponse.json({ success: false, message: "Paystack secret key is missing" }, { status: 500 });
    }

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
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 });
    }

    // Get logged-in user from session
    const email = session.user.email;
    if (!email) {
      return NextResponse.json({ success: false, message: "User email is missing" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: { select: { id: true, balance: true } } }, // Ensure wallet id and balance are included
    }) as { email: string; id: string; name: string | null; password: string; wallet: { id: string; balance: number } | null };

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Ensure the user has a wallet; if not, create one
    if (!user.wallet) {
      await prisma.wallet.create({
        data: {
          user: { connect: { id: user.id } },
          balance: amount,
        },
      });
    } else {
      // Update wallet balance
      await prisma.wallet.update({
        where: { id: user.wallet.id },
        data: { balance: { increment: amount } }, // Add deposit amount
      });
    }

    return NextResponse.json({ success: true, message: "Wallet funded successfully" });
  } catch (error) {
    console.error("Error in payment verification:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
