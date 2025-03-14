import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { User as AuthUser } from "next-auth";

interface Tier {
    price: number;
    features: string[];
}

interface Tiers {
    [key: string]: Tier;
}

interface User extends AuthUser {
    id: string;
}

interface Session {
    user: User;
}

// 👇 Initialize Prisma inside the function to avoid multiple instances
export async function POST(req: Request): Promise<Response> {
    const prisma = new PrismaClient();

    try {
        // Authenticate the user
        const session = await auth();
        const user: User | null = session?.user ? { ...session.user, id: session.user.id ?? "" } : null;

        if (!user) {
            console.error("Unauthorized access attempt.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body safely
        let requestData;
        try {
            requestData = await req.json();
        } catch (err) {
            console.error("Failed to parse JSON:", err);
            return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 });
        }

        const { tier }: { tier: string } = requestData;

        const tiers: Tiers = {
            "Tier 1": { price: 1000, features: ["Basic Savings", "1 Group Membership"] },
            "Tier 2": { price: 5000, features: ["Advanced Savings", "3 Group Memberships"] },
            "Tier 3": { price: 10000, features: ["Premium Savings", "Unlimited Groups"] },
            "Tier 4": { price: 20000, features: ["Elite Savings", "Priority Support"] },
        };

        if (!tiers[tier]) {
            console.error("Invalid tier selection:", tier);
            return NextResponse.json({ error: "Invalid tier selected" }, { status: 400 });
        }

        console.log(`User ${user.id} selected ${tier} - Price: ${tiers[tier].price}`);

        // ✅ Ensure that the user exists in the database
        const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!existingUser) {
            console.error(`User ${user.id} not found in database.`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ✅ Create an isusuPurchase record
        const isusuPurchase = await prisma.isusuPurchase.create({
            data: {
                userId: user.id,
                tier,
                amount: tiers[tier].price,
                status: "pending",
            },
        });

        console.log(`isusuPurchase created successfully:`, isusuPurchase.id);

        return NextResponse.json(
            { message: "isusuPurchase initiated", isusuPurchaseId: isusuPurchase.id },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Unexpected error:", error);

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    } finally {
        await prisma.$disconnect(); // Ensure Prisma disconnects after execution
    }
}
