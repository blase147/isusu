// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function POST(req: Request) {
//   try {
//     console.log("Received Request:", req); // Debugging request

//     const body = await req.json().catch(() => null); // Prevents crash if body is empty

//     console.log("Parsed Body:", body); // Debugging body

//     if (!body || Object.keys(body).length === 0) {
//       return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
//     }

//     const { isusuName, isusuClass, frequency, milestone } = body;

//     if (!isusuName || !isusuClass || !frequency || milestone == null) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     const newIsusu = await prisma.isusu.create({
//       data: { isusuName, isusuClass, frequency, milestone, createdBy: { connect: { id: "defaultUserId" } } }, // Replace "defaultUserId" with the actual user ID
//     });

//     return NextResponse.json(newIsusu, { status: 201 });
//   } catch (error) {
//     console.error("Error creating Isusu group:", error);
//     return NextResponse.json({ error: "Failed to create Isusu group" }, { status: 500 });
//   }
// }

// // Handle GET Request (Fetch Isusu Groups)
// export async function GET() {
//   try {
//     const allIsusuGroups = await prisma.isusu.findMany(); // Fetch all groups
//     return NextResponse.json(allIsusuGroups, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching Isusu groups:", error);
//     return NextResponse.json({ error: "Failed to fetch Isusu groups" }, { status: 500 });
//   }
// }
