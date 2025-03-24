import { NextResponse } from "next/server";
import { processDeductions } from "@/app/workers/deductionProcessor"; // Ensure this path is correct
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server"; // ✅ Import NextRequest

const prisma = new PrismaClient();

export async function GET(req: NextRequest): Promise<NextResponse> {
    // ✅ Check Authorization using CRON_SECRET
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("🔄 Running scheduled deductions...");

        // ✅ Fetch all active Isusu groups
        const isusuGroups = await prisma.isusu.findMany();

        for (const group of isusuGroups) {
            await processDeductions(group.id);
        }

        return NextResponse.json({ success: true, message: "Deductions processed" });
    } catch (error) {
        console.error("❌ Error processing deductions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
