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

export async function PUT(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const updates: Record<string, string | null> = {};

        // Handle text updates
        formData.forEach((value, key) => {
            if (key !== "image") {
                updates[key] = value.toString();
            }
        });

        // Handle image upload
        const file = formData.get("image") as File | null;
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResponse = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "profile_pictures", resource_type: "auto" },
                    (error, result) => error ? reject(error) : resolve(result)
                ).end(buffer);
            });

            updates["profilePicture"] = (uploadResponse as { secure_url: string }).secure_url;
        }

        // If no fields were provided, return an error
        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No data to update" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email as string },
            data: updates,
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "User update failed", details: (error as Error).message }, { status: 400 });
    }
}

