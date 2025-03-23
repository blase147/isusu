import { NextResponse } from 'next/server';
import { processDeductions } from '@/./app/workers/deductionProcessor'; // Ensure this path is correct
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Request {
    headers: {
        get: (name: string) => string | null;
    };
}

interface IsusuGroup {
    id: string;
}

export async function GET(req: Request): Promise<NextResponse> {
    // Check authorization using CRON_SECRET
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log("🔄 Running scheduled deductions...");

        // Fetch all active Isusu groups
        const isusuGroups: IsusuGroup[] = await prisma.isusu.findMany();

        for (const group of isusuGroups) {
            await processDeductions(group.id);
        }

        return NextResponse.json({ success: true, message: "Deductions processed" });
    } catch (error) {
        console.error("❌ Error processing deductions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
