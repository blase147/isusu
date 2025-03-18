import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth"; // Ensure this is correctly configured

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        console.log("📌 Request to toggle admin status initiated.");

        // Authenticate user
        const session = await auth();
        if (!session || !session.user) {
            console.error("❌ Unauthorized request.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.log("✅ User authenticated:", session.user.email);

        // Parse request body
        let body;
        try {
            body = await req.json();
            console.log("📌 Parsed request body:", body);
        } catch (parseError) {
            console.error("❌ Invalid JSON format:", parseError);
            return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
        }

        const { memberId, isusuId } = body;
        if (!memberId || !isusuId) {
            console.error("❌ Missing required parameters:", { memberId, isusuId });
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }
        console.log(`ℹ️ Processing Isusu group ID: ${isusuId} for member: ${memberId}`);

        // Fetch the current Isusu group with its admins
        const isusu = await prisma.isusu.findUnique({
            where: { id: isusuId },
            include: { admins: { select: { id: true, name: true } } }, // Only fetch admin IDs
        });
        if (!isusu) {
            console.error(`❌ Isusu group not found for ID: ${isusuId}`);
            return NextResponse.json({ error: "Isusu group not found" }, { status: 404 });
        }
        console.log("✅ Isusu group found. Current admins:", isusu.admins);

        // Ensure `admins` is an array
        const currentAdmins = isusu.admins.map((admin) => admin.id);

        // Check if the member is already an admin
        const isAlreadyAdmin = currentAdmins.includes(memberId);
        const updatedAdmins = isAlreadyAdmin
            ? currentAdmins.filter((id) => id !== memberId) // Remove from admin list
            : [...currentAdmins, memberId]; // Add to admin list

        console.log("🔄 Updated admins array:", updatedAdmins);

        // Update the Isusu group in the database
        await prisma.isusu.update({
            where: { id: isusuId },
            data: {
                admins: {
                    connect: isAlreadyAdmin ? [] : [{ id: memberId }], // ✅ Add admin
                    disconnect: isAlreadyAdmin ? [{ id: memberId }] : [], // ✅ Remove admin
                },
            },
        });


        console.log(`✅ Admin status successfully ${isAlreadyAdmin ? "removed" : "added"} for member: ${memberId}`);

        // Fetch the updated Isusu group to return the new admin list
        const updatedIsusu = await prisma.isusu.findUnique({
            where: { id: isusuId },
            include: { admins: { select: { id: true, name: true } } }, // Fetch updated admins
        });

        // Extract admin IDs for frontend processing
        const adminIds = updatedIsusu?.admins.map((admin) => admin.id) || [];
        console.log("📌 Updated admin IDs:", adminIds);

        // Fetch full members list (assuming a `members` relation exists)
        const members = await prisma.isusuMembers.findMany({
            where: { isusuId },
            select: { id: true, userId: true, user: { select: { name: true } } }, // Ensure to select existing properties
        });
        console.log("🔎 Updated Isusu:", JSON.stringify(updatedIsusu, null, 2));
        console.log("📌 Admin IDs:", adminIds);
        console.log("📌 Members:", JSON.stringify(members, null, 2));

        return NextResponse.json({
            success: true,
            action: isAlreadyAdmin ? "removed" : "added",
            members: members.map((member) => ({
                id: member.id,
                name: member.user.name,
                isAdmin: adminIds.includes(member.userId),
            })),
        });
    } catch (error) {
        console.error("❌ Unexpected error updating admin status:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
