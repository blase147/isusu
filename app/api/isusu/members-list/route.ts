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

    // Fetch members for the given isusuId
    const members = await prisma.isusuMembers.findMany({
      where: { isusuId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ members: members.map((member) => ({
      id: member.user.id,
      name: member.user.name || "Unknown",
      email: member.user.email,
    })) });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
