import { PrismaClient } from "@prisma/client";
import { deductionQueue } from "../lib/queues";
import { processDeductions } from "./deductionProcessor";

const prisma = new PrismaClient();

async function scheduleDeductions() {
  console.log("⏳ Checking for scheduled deductions...");

  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const dayOfMonth = today.getDate(); // 1-31

    const isusus = await prisma.isusu.findMany({
      where: { isActive: true }, // Corrected field name
      include: { members: true }, // Ensure members relation exists
    });

    for (const isusu of isusus) {
      let shouldDeduct = false;

      if (isusu.frequency === "daily") {
        shouldDeduct = true;
      } else if (isusu.frequency === "weekly" && dayOfWeek === 1) {
        shouldDeduct = true;
      } else if (isusu.frequency === "monthly" && dayOfMonth === 1) {
        shouldDeduct = true;
      }

      if (shouldDeduct) {
        console.log(`📅 Scheduling deduction for Isusu group: ${isusu.isusuName}`);

        for (const member of isusu.members) {
          await deductionQueue.add("deduction", {
            userId: member.id,
            isusuId: isusu.id,
            amount: isusu.milestone, // Ensure this field exists
          });
        }

        await processDeductions(isusu.id);
      }
    }

    console.log("✅ All scheduled deductions processed.");
  } catch (error) {
    console.error("🚨 Error running scheduled deductions:", error);
  }
}

scheduleDeductions();
