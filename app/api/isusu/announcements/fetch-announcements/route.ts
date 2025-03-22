import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const isusuId = searchParams.get("isusuId");

        if (!isusuId) {
            return NextResponse.json({ error: "isusuId is required" }, { status: 400 });
        }

        const announcements = await prisma.announcement.findMany({
            where: { isusuId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(announcements);
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
