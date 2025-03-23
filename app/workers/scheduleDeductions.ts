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
    const month = today.getMonth() + 1; // 1 = January, 12 = December

    const isFirstDayOfMonth = dayOfMonth === 1;
    const semiAnnualMonths = [1, 7]; // Jan, Jul

    const isusus = await prisma.isusu.findMany({
      where: { isActive: true }, // Ensure this field exists
      include: { members: true },
    });

    for (const isusu of isusus) {
      let shouldDeduct = false;

      switch (isusu.frequency) {
        case "Daily":
          shouldDeduct = true;
          break;
        case "Weekly":
          shouldDeduct = dayOfWeek === 1; // Mondays
          break;
        case "Biweekly":
          shouldDeduct = isFirstDayOfMonth;
          break;
        case "Monthly":
          shouldDeduct = isFirstDayOfMonth;
          break;
        case "Third Quarterly":
          shouldDeduct = month === 7 && isFirstDayOfMonth; // Runs only in July
          break;
        case "Semi-Annually":
          shouldDeduct = semiAnnualMonths.includes(month) && isFirstDayOfMonth;
          break;
        case "Annually":
          shouldDeduct = month === 1 && isFirstDayOfMonth;
          break;
        default:
          console.warn(`⚠️ Unknown frequency type: ${isusu.frequency}`);
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
