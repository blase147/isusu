import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    console.log("🔍 Received request to send money");

    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const senderEmail = session.user.email.toLowerCase();
    const requestBody = await req.json();

    console.log("📩 Parsed Request Data:", requestBody);

    const { recipientEmail, groupId, amount, tier, isIsusuGroup = false } = requestBody;
    const isIsusu = Boolean(isIsusuGroup) || Boolean(groupId);

    console.log("📌 isIsusu:", isIsusu);
    console.log("📌 recipientEmail:", recipientEmail || "N/A");
    console.log("📌 groupId:", groupId || "N/A");
    console.log("📌 amount:", amount);
    console.log("📌 tier:", tier);

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid transaction amount" }, { status: 400 });
    }

    const sender = await prisma.user.findUnique({
      where: { email: senderEmail },
      include: { wallet: true },
    });

    if (!sender || !sender.wallet) {
      return NextResponse.json({ success: false, message: "Sender not found or has no wallet" }, { status: 404 });
    }

    if (!isIsusu && !recipientEmail) {
      return NextResponse.json({ success: false, message: "Recipient email is required for individual transfers" }, { status: 400 });
    }

    const transactionRef = `TX-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    if (isIsusu) {
      if (!groupId || typeof groupId !== "string") {
        return NextResponse.json({ success: false, message: "Invalid group ID" }, { status: 400 });
      }

      const isusu = await prisma.isusu.findUnique({
        where: { id: groupId },
        include: { wallet: true },
      })

      if (!isusu || !isusu.wallet) {
        return NextResponse.json({ success: false, message: "Isusu group not found or has no wallet" }, { status: 404 });
      }

      if (sender.wallet.balance < amount) {
        return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 });
      }

      try {
        await prisma.$transaction([
          prisma.wallet.update({
            where: { id: sender.wallet.id },
            data: { balance: { decrement: amount } },
          }),
          prisma.wallet.update({
            where: { id: isusu.wallet.id },
            data: { balance: { increment: amount } },
          }),
          prisma.transaction.create({
            data: {
              amount,
              type: "TRANSFER",
              status: "SUCCESS",
              senderId: sender.id,
              isusuId: isusu.id,
              reference: transactionRef,
              description: `Donation to Isusu Group: ${isusu.isusuName}`,
            },
          }),
          prisma.notification.create({
            data: {
              userId: sender.id,
              type: "TRANSFER",
              message: `You sent ₦${amount} to the Isusu group: ${isusu.isusuName}.`,
            },
          }),
        ]);
      } catch (error) {
        console.error("🚨 Transaction Failed:", error);
      }


      return NextResponse.json({ success: true, message: "Funds transferred to Isusu group wallet" }, { status: 200 });
    }

    // Handle individual transfers
    const recipientEmailLower = recipientEmail.toLowerCase();
    let recipient = await prisma.user.findUnique({
      where: { email: recipientEmailLower },
      include: { wallet: true },
    });

    if (!recipient) {
      recipient = await prisma.user.create({
        data: { email: recipientEmailLower, password: "defaultPassword", wallet: { create: { balance: 0 } } },
        include: { wallet: true },
      });
    } else if (!recipient.wallet) {
      recipient.wallet = await prisma.wallet.create({
        data: { user: { connect: { id: recipient.id } }, balance: 0 },
      });
    }

    if (sender.wallet.balance < amount) {
      return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.wallet.update({ where: { id: sender.wallet.id }, data: { balance: { decrement: amount } } }),
      prisma.wallet.update({ where: { id: recipient.wallet!.id }, data: { balance: { increment: amount } } }),
      prisma.transaction.create({
        data: {
          amount,
          type: "TRANSFER",
          status: "SUCCESS",
          senderId: sender.id,
          recipientId: recipient.id,
          reference: transactionRef,
          description: `Money transfer to ${recipient.name || recipient.email}`,
        },
      }),
    ]);

    // Separate Notifications (Outside Transaction)
    await prisma.notification.create({
      data: {
        userId: sender.id,
        type: "TRANSFER",
        message: `You sent ₦${amount} to ${recipient.name}.`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: recipient.id,
        type: "TRANSFER",
        message: `You received ₦${amount} from ${sender.name}.`,
      },
    });


    return NextResponse.json({ success: true, message: "Transfer successful" }, { status: 200 });
  } catch (error) {
    console.error("🚨 Error:", error);
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 });
  }
}
