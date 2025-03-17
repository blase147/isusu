import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Ensure "@/auth" is correctly configured

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        // ✅ Authenticate user
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ Parse JSON body
        const body = await req.json();
        const { memberId, isusuId } = body;

        if (!memberId || !isusuId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // ✅ Toggle admin status (Adjust logic based on your schema)
        const isusu = await prisma.isusu.update({
            where: { id: isusuId },
            data: {
                admins: {
                    connect: { id: memberId }, // Assuming `admins` is a relation
                },
            },
        });

        return NextResponse.json({ success: true, isusu });

    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
