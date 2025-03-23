import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Custom authentication middleware

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        console.log("Checking session...");
        const session = await auth();
        console.log("Session data:", session);

        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Fetch user ID from the database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
        }

        const userId = user.id;

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid JSON payload" }, { status: 400 });
        }

        const { isusuId, tier, amount, status, paystackReference } = body;

        if (!isusuId || !tier || !amount || !status || !paystackReference) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const existingIsusuPurchase = await prisma.isusuPurchase.findFirst({
            where: { userId, isusuId },
        });

        if (existingIsusuPurchase) {
            const updatedIsusuPurchase = await prisma.isusuPurchase.update({
                where: { id: existingIsusuPurchase.id },
                data: { userId, isusuId, tier, amount, status, paystackReference },
            });

            return NextResponse.json({
                success: true,
                message: "Isusu Purchase updated successfully",
                isusuPurchase: updatedIsusuPurchase,
            });
        } else {
            const newIsusuPurchase = await prisma.isusuPurchase.create({
                data: { userId, isusuId, tier, amount, status, paystackReference },
            });

            return NextResponse.json({
                success: true,
                message: "Isusu Purchase created successfully",
                isusuPurchase: newIsusuPurchase,
            });
        }
    } catch (error) {
        console.error("Error updating or creating Isusu Purchase:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update or create Isusu Purchase" },
            { status: 500 }
        );
    }
}
