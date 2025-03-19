import { NextResponse } from "next/server";
import { auth } from "@/auth"; // ✅ Correct import for authentication
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Get the authenticated user session
        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user from database using session email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, email: true, profilePicture: true }, // ✅ Ensure profilePicture is included
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
