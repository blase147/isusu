import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client"; // ✅ Correct import

const prisma = new PrismaClient(); // ✅ Create Prisma instance

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { isusuName, isusuClass, frequency, milestone } = req.body;

    const newIsusu = await prisma.isusu.create({
      data: {
        isusuName,
        isusuClass,
        frequency,
        milestone,
      },
    });

    res.status(201).json(newIsusu);
  } catch (error) {
    console.error("Error creating Isusu group:", error);
    res.status(500).json({ error: "Failed to create Isusu group" });
  }
}
