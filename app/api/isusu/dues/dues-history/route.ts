import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();


interface GetRequest {
    url: string;
}

interface DuesHistoryQueryParams {
    isusuId: string;
    startDate?: string;
    endDate?: string;
}

interface DuesHistory {
    paymentDate: Date;
    amount: number;
    status: string;
}

export async function GET(req: GetRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const isusuId = searchParams.get("isusuId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!isusuId) {
            return NextResponse.json({ error: "isusuId is required" }, { status: 400 });
        }

        // Construct query filters
        const whereClause: DuesHistoryQueryParams = {
            isusuId,
            ...(startDate && endDate
                ? { paymentDate: { gte: new Date(startDate), lte: new Date(endDate) } }
                : {}),
        };

        // Fetch data from Prisma
        const dues: DuesHistory[] = await prisma.isusuDues.findMany({
            where: whereClause,
            select: {
                paymentDate: true,
                amount: true,
                status: true,
            },
            orderBy: { paymentDate: "desc" },
        });

        return NextResponse.json(dues);
    } catch (error) {
        console.error("Error fetching dues history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
