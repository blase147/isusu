import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ GET: Retrieve User Profile
export async function GET(req: Request) {
    try {
        // Authenticate user
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const email = url.searchParams.get("email") || session.user.email; // Use session email if no query param

        // Fetch user details
        const user = await prisma.user.findUnique({
            where: { email },
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

// ✅ PUT: Update User Profile
export async function PUT(req: Request) {
    try {
        // Authenticate user
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Authenticated user:", session.user.email); // ✅ Debugging log

        const formData = await req.formData();
        const updates: Record<string, string | null> = {};

        // Process form fields except image
        formData.forEach((value, key) => {
            if (key !== "image") {
                updates[key] = value.toString();
            }
        });

        // Handle profile picture upload
        const file = formData.get("image") as File | null;
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResponse = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "profile_pictures", resource_type: "auto" },
                    (error, result) => (error ? reject(error) : resolve(result))
                ).end(buffer);
            });

            updates["profilePicture"] = (uploadResponse as { secure_url: string }).secure_url;
        }

        // If no updates, return an error
        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No data to update" }, { status: 400 });
        }

        // Update user in the database
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updates,
        });

        return NextResponse.json({ message: "User updated successfully", user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "User update failed", details: (error as Error).message }, { status: 400 });
    }
}
