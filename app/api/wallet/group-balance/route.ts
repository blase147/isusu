import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Extract isusuId from request query
    const { searchParams } = new URL(req.url);
    const isusuId = searchParams.get("isusuId");
    if (!isusuId) {
      return NextResponse.json({ success: false, message: "isusuId is required" }, { status: 400 });
    }

    // Fetch group with wallet balance
    const group = await prisma.isusu.findUnique({
      where: { id: isusuId },
      include: { wallet: true },
    });

    if (!group || !group.wallet) {
      return NextResponse.json({ success: false, message: "Group wallet not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      balance: group.wallet.balance,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
