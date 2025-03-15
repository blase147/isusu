import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();
const ADMIN_EMAIL = "solarmails2@gmail.com"; // Admin wallet receiver

export async function POST(req: Request) {
    try {
        const session = await auth(); // Authenticate user
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { amount } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Find the admin user
        const adminUser = await prisma.user.findUnique({
            where: { email: ADMIN_EMAIL },
            select: { id: true, walletId: true }, // Select only necessary fields
        });

        if (!adminUser) {
            return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
        }

        // Ensure the admin has a wallet
        let adminWallet = await prisma.wallet.findUnique({
            where: { id: adminUser.walletId ?? "" }, // Use walletId if it exists
        });

        // If the wallet doesn't exist, create one
        if (!adminWallet) {
            adminWallet = await prisma.wallet.create({
                data: {
                    user: { connect: { id: adminUser.id } }, // Link to admin
                },
            });

            // Update the user with the new wallet ID
            await prisma.user.update({
                where: { id: adminUser.id },
                data: { walletId: adminWallet.id },
            });
        }

        // Update the wallet balance
        const updatedWallet = await prisma.wallet.update({
            where: { id: adminWallet.id },
            data: {
                balance: { increment: amount }, // ✅ Add amount to wallet balance
            },
        });

        return NextResponse.json({
            message: `₦${amount} successfully credited to ${ADMIN_EMAIL}!`,
            newBalance: updatedWallet.balance,
        });
    } catch (error) {
        console.error("Error processing Isusu purchase:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
