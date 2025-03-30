import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET: Retrieve a Specific User Profile
export async function GET(req: NextRequest) {
    try {
        // Extract user ID from URL
        const url = new URL(req.url);
        const userId = url.pathname.split("/").pop(); // Get the last segment of the URL

        if (!userId) {
            return NextResponse.json({ error: "User ID is missing" }, { status: 400 });
        }

        console.log("Fetching user with ID:", userId);

        // Fetch user from the database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                dateOfBirth: true,
                address: true,
                biography: true,
                bankAccount: true,
                occupation: true,
                profilePicture: true,
            },
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
