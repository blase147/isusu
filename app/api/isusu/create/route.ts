import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null); // Handle invalid JSON

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
    }

    const { isusuName, isusuClass, frequency, milestone } = body;

    if (!isusuName || !isusuClass || !frequency || milestone == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Optional: Prevent duplicate Isusu names
    const existingIsusu = await prisma.isusu.findUnique({ where: { id: isusuName } }); // Assuming isusuName is unique and can be used as id
    if (existingIsusu) {
      return NextResponse.json({ error: "Isusu group with this name already exists" }, { status: 400 });
    }

    // Create Isusu and add creator as a member
    const newIsusu = await prisma.isusu.create({
      data: {
        isusuName,
        isusuClass,
        frequency,
        milestone,
        createdById: user.id, // Assign user as creator
        members: {
          create: {
            user: { connect: { id: user.id } }, // Add creator as first member
          },
        },
      },
    });

    return NextResponse.json(newIsusu, { status: 201 });
  } catch (error) {
    console.error("Error creating Isusu group:", error);
    return NextResponse.json({ error: "Failed to create Isusu group" }, { status: 500 });
  }
}

