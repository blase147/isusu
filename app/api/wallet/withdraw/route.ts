import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, bankName, bankCode, accountNumber } = body;

    if (!amount || !bankName || !bankCode || !accountNumber) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!PAYSTACK_SECRET) {
      return NextResponse.json(
        { success: false, message: "Payment service not configured" },
        { status: 500 }
      );
    }

    console.log("Processing withdrawal:", { amount, bankName, bankCode, accountNumber });

    // Step 1: Create Paystack transfer recipient
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
        bank_code: bankCode, // ✅ Use the provided bank code
        currency: "NGN",
      }),
    });

    const recipientData = await recipientResponse.json();

    if (!recipientData.status || !recipientData.data?.recipient_code) {
      console.error("Recipient Creation Failed:", recipientData);
      return NextResponse.json(
        { success: false, message: "Failed to create transfer recipient" },
        { status: 400 }
      );
    }

    const recipientCode = recipientData.data.recipient_code;

    console.log("Recipient created:", recipientCode);

    // Step 2: Initiate Withdrawal (Transfer)
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
      body: JSON.stringify({
        source: "balance",
        amount: Number(amount) * 100, // ✅ Convert to kobo
        recipient: recipientCode,
        reason: "Wallet Withdrawal",
      }),
    });

    const transferData = await transferResponse.json();

    if (transferData.status) {
      console.log("Transfer successful:", transferData);
      return NextResponse.json(
        { success: true, message: "Withdrawal successful", data: transferData.data },
        { status: 200 }
      );
    } else {
      console.error("Transfer Failed:", transferData);
      return NextResponse.json(
        { success: false, message: transferData.message || "Withdrawal failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
