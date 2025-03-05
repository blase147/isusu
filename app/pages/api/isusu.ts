import { NextApiRequest, NextApiResponse } from "next";
// import { PrismaClient } from "@prisma/client"; // ✅ Correct import
import prisma from "../../lib/prisma"; // ✅ Correct import

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newIsusu = await prisma.isusu.create({
      data: {
        isusuName: body.isusuName,
        isusuClass: body.isusuClass,
        frequency: body.frequency,
        milestone: body.milestone,
      },
    });

    return NextResponse.json(newIsusu, { status: 201 });
  } catch (error) {
    console.error("Error creating Isusu group:", error);
    return NextResponse.json({ error: "Failed to create Isusu group" }, { status: 500 });
  }
}
