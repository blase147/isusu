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
        const userId = formData.get("userId") as string | null; // ✅ Get userId from formData
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        console.log("Updating userId:", userId); // 🔍 Debugging log

        const updates: Record<string, string | null> = {};

        formData.forEach((value, key) => {
            if (key !== "image") {
                updates[key] = value.toString();
            }
        });

        if (updates.dateOfBirth) {
            updates.dateOfBirth = new Date(updates.dateOfBirth).toISOString();
        }

        const file = formData.get("image") as File | null;
        if (file) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());

                const uploadResponse = await new Promise<{ secure_url: string }>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "profile_pictures", resource_type: "auto" },
                        (error, result) => {
                            if (error) {
                                console.error("Cloudinary upload error:", error);
                                reject(error);
                            } else if (!result?.secure_url) {
                                reject(new Error("Cloudinary upload failed: No secure_url returned"));
                            } else {
                                resolve(result as { secure_url: string });
                            }
                        }
                    );
                    stream.end(buffer);
                });

                updates["profilePicture"] = uploadResponse.secure_url;
            } catch (cloudinaryError) {
                console.error("Image upload failed:", cloudinaryError);
                return NextResponse.json({ error: "Image upload failed" }, { status: 400 });
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No data to update" }, { status: 400 });
        }

        console.log("Final data being updated:", updates);

        const updatedUser = await prisma.user.update({
            where: { id: userId }, // ✅ Now updates the selected user, not just the logged-in user
            data: updates,
        });

        console.log("Updated user:", updatedUser);

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json(
            { error: "User update failed", details: (error as Error).message },
            { status: 400 }
        );
    }
}

