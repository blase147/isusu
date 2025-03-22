import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { title, message, isusuId } = await req.json();

        if (!isusuId) {
            return NextResponse.json({ error: "isusuId is required" }, { status: 400 });
        }

        // Create the announcement with a valid isusu relationship
        const announcement = await prisma.announcement.create({
            data: {
                title,
                message,
                createdAt: new Date(),
                isusu: {
                    connect: { id: isusuId }, // Ensure proper linking to the isusu group
                },
            },
        });

        return NextResponse.json(announcement, { status: 201 });
    } catch (error) {
        console.error("Error creating announcement:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
