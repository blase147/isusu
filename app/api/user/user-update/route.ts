import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

// Initialize Prisma client
const prisma = new PrismaClient();

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PUT request handler for updating user information
export async function PUT(req: Request) {
    // Authenticate the user by checking the session
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Retrieve form data from the request
        const formData = await req.formData();
        const userId = formData.get("userId") as string | null;

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Initialize updates object to hold form fields (except 'image')
        const updates: Record<string, string | null> = {};

        // Loop through form data and update the fields (skip 'image' and 'userId')
        formData.forEach((value, key) => {
            if (key !== "image" && key !== "userId") {
                updates[key] = value.toString();
            }
        });

        // If a dateOfBirth is provided, convert it to ISO string
        if (updates.dateOfBirth) {
            updates.dateOfBirth = new Date(updates.dateOfBirth).toISOString();
        }

        // Handle image upload if provided in the form
        const file = formData.get("image") as File | null;
        if (file) {
            try {
                // Convert the file to a buffer
                const buffer = Buffer.from(await file.arrayBuffer());

                // Upload the image to Cloudinary using the uploader stream
                const uploadResponse = await new Promise<{ secure_url: string }>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "profile_pictures", resource_type: "auto" },  // Cloudinary upload settings
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else if (!result?.secure_url) {
                                reject(new Error("Cloudinary upload failed: No secure_url returned"));
                            } else {
                                resolve(result as { secure_url: string });
                            }
                        }
                    );
                    stream.end(buffer);  // End the upload stream with the buffer
                });

                // Update profilePicture URL in the updates object
                updates["profilePicture"] = uploadResponse.secure_url;
            } catch {
                return NextResponse.json({ error: "Image upload failed" }, { status: 400 });
            }
        }

        // If there are no updates, return an error response
        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No data to update" }, { status: 400 });
        }

        // Update the user data in the database using Prisma
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updates,
        });

        // Return the updated user data in the response
        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json(
            { error: "User update failed", details: (error as Error).message },
            { status: 400 }
        );
    }
}
