import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Extract searchParams from the request URL
    const url = new URL(req.url);
    console.log("Full API Request URL:", url.href); // Log full URL for debugging

    const isusuId = url.searchParams.get("isusuId");
    console.log("Extracted isusuId:", isusuId); // Log the extracted ID

    if (!isusuId) {
      return NextResponse.json({ error: "No Isusu ID provided. Please check the URL." }, { status: 400 });
    }

    // Fetch the Isusu group along with its members based on the isusuId
    const isusuGroup = await prisma.isusu.findUnique({
      where: { id: isusuId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!isusuGroup) {
      return NextResponse.json({ error: "Isusu group not found" }, { status: 404 });
    }

    // Return the group name and members
    return NextResponse.json({
      isusuName: isusuGroup.isusuName, // Assuming 'isusuName' is a column in your 'isusu' table
      members: isusuGroup.members.map((member) => ({
        id: member.user.id,
        name: member.user.name || "Unknown",
        email: member.user.email,
      })),
    });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
