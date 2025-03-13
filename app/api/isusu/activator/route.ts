import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import schedule, { Job } from "node-schedule";

const prisma = new PrismaClient();
const activeSchedules: Record<string, Job> = {}; // Store active jobs

// Restore Jobs on Server Restart
async function restoreScheduledJobs() {
  console.log("🔹 Restoring scheduled jobs...");
  const activeIsusus = await prisma.isusu.findMany({
    where: { isActive: true },
    select: { id: true, frequency: true },
  });

  activeIsusus.forEach(({ id, frequency }) => {
    const cronExpression = frequencyMap[frequency.toLowerCase()];
    if (cronExpression) {
      activeSchedules[id] = schedule.scheduleJob(cronExpression, () => {
        console.log(`🔹 [Restored] Running Isusu deduction for ${id} at ${new Date().toISOString()}`);
      });
    }
  });

  console.log("✅ Restored jobs:", Object.keys(activeSchedules));
}

restoreScheduledJobs(); // Run on startup

const frequencyMap: Record<string, string> = {
  daily: "0 0 * * *",
  weekly: "0 0 * * 0",
  biweekly: "0 0 1,15 * *",
  monthly: "0 0 1 * *",
  quarterly: "0 0 1 */3 *",
  annually: "0 0 1 1 *",
};

export async function POST(req: Request) {
  try {
    console.log("🔹 Starting Isusu Activation");

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userId = user.id;
    const { groupId: isusuId } = await req.json();

    if (!isusuId) return NextResponse.json({ error: "groupId is required" }, { status: 400 });

    const isusu = await prisma.isusu.findUnique({
      where: { id: isusuId },
      include: { members: true },
    });

    if (!isusu) return NextResponse.json({ error: "Isusu not found" }, { status: 404 });

    if (isusu.createdById !== userId) {
      return NextResponse.json({ error: "Only the Isusu owner can activate this" }, { status: 403 });
    }

    // Activate Isusu
    const updatedIsusu = await prisma.isusu.update({
      where: { id: isusuId },
      data: { invite_code: undefined, isActive: true, startDate: new Date() },
    });

    console.log("✅ Updated Isusu:", updatedIsusu);

    // Set end date
    const durationDays = { weekend_oringo: 7, uwamgbede: 14, payday_flex: 30, club_merchants: 90, doublers_arena: 180, party_mongers: 365 }[isusu.isusuClass.toLowerCase()];
    const endDate = new Date();
    if (durationDays === undefined) {
      return NextResponse.json({ error: "Invalid Isusu class" }, { status: 400 });
    }
    endDate.setDate(endDate.getDate() + durationDays);

    const cronExpression = frequencyMap[isusu.frequency.toLowerCase()];
    if (!cronExpression) return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });

    // Cancel previous jobs
    if (activeSchedules[isusuId]) {
      activeSchedules[isusuId].cancel();
      console.log("🔹 Cancelled previous job for Isusu:", isusuId);
    }

    // Schedule new deductions
activeSchedules[isusuId] = schedule.scheduleJob(cronExpression, async () => {
  console.log(`🔹 Running Isusu deduction for ${isusuId} at`, new Date().toISOString());

  const now = new Date();
  if (now >= endDate) {
    console.log(`⛔ Isusu ${isusuId} duration has ended. Stopping deductions.`);
    activeSchedules[isusuId].cancel();
    delete activeSchedules[isusuId];

    await prisma.isusu.update({
      where: { id: isusuId },
      data: { isActive: false },
    });

    return;
  }

  console.log(`🔹 Fetching members for Isusu ${isusuId}...`);
  console.log(`🔹 Members count: ${isusu.members.length}`);

  for (const member of isusu.members) {
    console.log(`🔹 Processing deduction for user ${member.userId}...`);

    try {
      const wallet = await prisma.wallet.findUnique({
        where: { id: member.userId },
      });

      if (!wallet) {
        console.warn(`⛔ Wallet not found for user ${member.userId}`);
        continue;
      }

      console.log(`💰 Wallet balance: ${wallet.balance}, Required: ${isusu.milestone}`);

      if (wallet.balance < isusu.milestone) {
        console.warn(`⛔ Insufficient balance for user ${member.userId}`);
        continue;
      }

      console.log(`🔹 Deducting ${isusu.milestone} from user ${member.userId}`);

      // Deduct balance
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: isusu.milestone } },
      });

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          senderId: member.userId,
          isusuGroupId: isusuId,
          amount: isusu.milestone,
          type: "WITHDRAWAL",
          status: "SUCCESS",
          reference: `ISUSU_${isusuId}_${Date.now()}`,
          description: `Isusu deduction for ${isusu.frequency}`,
          isIsusu: true,
        },
      });

      console.log(`✅ Transaction created:`, transaction);
    } catch (err) {
      console.error(`⛔ Error processing deduction for user ${member.userId}:`, err);
    }
  }
});


    console.log("✅ Job scheduled successfully");

    return NextResponse.json({ isActive: true, endDate, activeJobs: Object.keys(activeSchedules) }, { status: 200 });
  } catch (error) {
    console.error("⛔ Error activating Isusu:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET route to check active jobs
export async function GET() {
  return NextResponse.json({ activeJobs: Object.keys(activeSchedules) }, { status: 200 });
}

// Manually Trigger Job
export async function PUT(req: Request) {
  const { isusuId } = await req.json();

  if (!isusuId || !activeSchedules[isusuId]) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  activeSchedules[isusuId].invoke();
  return NextResponse.json({ message: "Job triggered manually" }, { status: 200 });
}
