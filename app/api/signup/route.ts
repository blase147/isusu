import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("Incoming request:", req);

    const body = await req.json().catch(() => null);
    console.log("Parsed body:", body);

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON data received." }, { status: 400 });
    }

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Ensure prisma.user is defined (model should be singular, not user)
    if (!prisma.user) {
      throw new Error("Prisma model `user` is undefined. Check your Prisma schema.");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists." }, { status: 400 });
    }

    // Hash password safely
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      throw new Error("Password hashing failed.");
    }

    // Create new user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json({ user }, { status: 201 });

  } catch (error: unknown) {
    console.error("Signup error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
