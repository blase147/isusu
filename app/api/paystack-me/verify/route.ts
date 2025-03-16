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

    console.log("Transaction Verified Successfully:", reference, amount);

    // ✅ Force crediting ADMIN instead of purchaser
    const adminUser = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL }, // Use admin email from .env
      include: { wallet: { select: { id: true, balance: true } } },
    });

    if (!adminUser) {
      return NextResponse.json({ success: false, message: "Admin user not found" }, { status: 404 });
    }

    console.log("Admin User:", adminUser);

    // Ensure the admin has a wallet
    if (!adminUser.wallet) {
      const adminWallet = await prisma.wallet.create({
        data: {
          user: { connect: { id: adminUser.id } },
          balance: amount,
        },
      });

      console.log("Admin Wallet Created:", adminWallet);
    } else {
      // ✅ Update **Admin's** wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: { id: adminUser.wallet.id },
        data: { balance: { increment: amount } },
      });

      console.log("Admin Wallet Updated:", updatedWallet);
    }

    return NextResponse.json({
      success: true,
      message: `₦${amount} successfully credited to admin (${process.env.ADMIN_EMAIL})`,
    });
  } catch (error) {
    console.error("🚨 Error in payment verification:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

