import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import schedule, { Job } from "node-schedule";

const prisma = new PrismaClient();
const activeSchedules: Record<string, Job> = {}; // Track active jobs

// ✅ API Route to Check Active Jobs
export async function GET() {
  return NextResponse.json({ activeJobs: Object.keys(activeSchedules) });
}

// ✅ Activation Route (POST)
export async function POST(req: Request) {
  try {
    console.log("🔹 Starting Isusu Activation");

    // Step 1: Authorization check
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Fetch the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userId = user.id;
    console.log("🔹 Fetched User ID:", userId);

    // Step 3: Parse request body
    const bodyText = await req.text();
    if (!bodyText) return NextResponse.json({ error: "Request body is missing" }, { status: 400 });

    let isusuId: string;
    try {
      isusuId = JSON.parse(bodyText).groupId;
      if (!isusuId) throw new Error("groupId is required");
    } catch {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    // Step 4: Fetch Isusu data
    const isusu = await prisma.isusu.findUnique({
      where: { id: isusuId },
      include: { members: true },
    });

    if (!isusu) return NextResponse.json({ error: "Isusu not found" }, { status: 404 });

    if (isusu.createdById !== userId) {
      return NextResponse.json({ error: "Only the owner can activate this" }, { status: 403 });
    }

    // Step 5: Activate Isusu
    const updatedIsusu = await prisma.isusu.update({
      where: { id: isusuId },
      data: { invite_code: undefined, isActive: true, startDate: new Date() },
    });

    console.log("✅ Isusu Activated:", updatedIsusu);

    // Step 6: Calculate End Date
    const isusuDuration: Record<string, number> = {
      weekend_oringo: 7,
      uwamgbede: 14,
      payday_flex: 30,
      club_merchants: 90,
      doublers_arena: 180,
      party_mongers: 365,
    };

    const durationDays = isusuDuration[isusu.isusuClass.toLowerCase()];
    if (!durationDays) {
      return NextResponse.json({ error: "Invalid isusuClass" }, { status: 400 });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    console.log("🔹 Isusu end date:", endDate);

    // Step 7: Map Frequency to Cron
    const frequencyMap: Record<string, string> = {
      daily: "0 0 * * *",
      weekly: "0 0 * * 0",
      biweekly: "0 0 1,15 * *",
      monthly: "0 0 1 * *",
      quarterly: "0 0 1 */3 *",
      annually: "0 0 1 1 *",
    };

    const cronExpression = frequencyMap[isusu.frequency.toLowerCase()];
    if (!cronExpression) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }

    // Step 8: Cancel Previous Job (if exists)
    if (activeSchedules[isusuId]) {
      activeSchedules[isusuId].cancel();
      delete activeSchedules[isusuId];
      console.log("🔹 Cancelled previous job for:", isusuId);
    }

    // Step 9: Schedule New Isusu Job
    activeSchedules[isusuId] = schedule.scheduleJob(cronExpression, async () => {
      console.log(`🔹 Running deduction for Isusu: ${isusuId}`);

      if (new Date() >= endDate) {
        console.log("⛔ Isusu ended. Stopping deductions.");
        activeSchedules[isusuId].cancel();
        delete activeSchedules[isusuId];

        await prisma.isusu.update({
          where: { id: isusuId },
          data: { isActive: false },
        });

        return;
      }

      for (const member of isusu.members) {
        await processDeduction(member.userId, isusu);
      }
    });

    console.log("✅ Job Scheduled:", cronExpression);

    // Step 10: Return Status
    return NextResponse.json({ isActive: true, endDate }, { status: 200 });
  } catch (error) {
    console.error("⛔ Error activating Isusu:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ Deduction Function with Retry Logic
async function processDeduction(userId: string, isusu: { id: string; milestone: number; frequency: string; members: { userId: string }[] }) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { id: userId },
    });

    if (!wallet || wallet.balance < isusu.milestone) {
      console.warn(`⛔ Insufficient balance for user ${userId}`);
      return;
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: isusu.milestone } },
      }),
      prisma.transaction.create({
        data: {
          senderId: userId,
          isusuGroupId: isusu.id,
          amount: isusu.milestone,
          type: "WITHDRAWAL",
          status: "SUCCESS",
          reference: `ISUSU_${isusu.id}_${Date.now()}`,
          description: `Isusu deduction for ${isusu.frequency}`,
          isIsusu: true,
        },
      }),
    ]);

    console.log(`✅ Deducted ${isusu.milestone} from user ${userId}`);
  } catch (err) {
    console.error(`⛔ Deduction failed for user ${userId}:`, err);
  }
}
