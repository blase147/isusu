import { NextResponse } from "next/server";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function GET() {
  try {
    if (!PAYSTACK_SECRET) {
      return NextResponse.json(
        { success: false, message: "Payment service not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch banks" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, banks: data.data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
