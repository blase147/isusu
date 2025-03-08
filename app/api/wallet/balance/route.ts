import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get user details from session
    const email = session.user.email;
    if (!email) {
      return NextResponse.json({ success: false, message: "Email not found" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ success: false, message: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      balance: user.wallet.balance,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
