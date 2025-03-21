import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { isusuId, amount } = await req.json();

        // Get the user making the payment
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                wallet: { select: { balance: true } }, // Fetch balance from wallet relation
            },
        });


        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if the Isusu exists
        const isusu = await prisma.isusu.findUnique({
            where: { id: isusuId },
            select: { id: true },
        });

        if (!isusu) {
            return NextResponse.json({ error: "Isusu group not found" }, { status: 404 });
        }

        // Ensure user has enough funds
        if (!user.wallet || user.wallet.balance < amount) {
            return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
        }

        // Deduct from user wallet and credit to group wallet
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { wallet: { update: { balance: { decrement: amount } } } },
            }),
            prisma.isusu.update({
                where: { id: isusu.id },
                data: { wallet: { update: { balance: { increment: amount } } } },
            }),
            prisma.isusuDues.create({
                data: {
                    isusuId: isusu.id,
                    userId: user.id,
                    amount,
                    status: "completed",
                    dueDate: new Date(), // or any appropriate date value
                },
            }),
        ]);

        return NextResponse.json({ message: "Dues paid successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error processing dues payment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
