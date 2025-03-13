import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import schedule, { Job } from "node-schedule";

const prisma = new PrismaClient();
const activeSchedules: Record<string, Job> = {}; // Store active jobs

export async function POST(req: Request) {
  try {
    console.log("🔹 Starting Isusu Activation");

    // Step 1: Authorization check
    const session = await auth();
    console.log("🔹 Fetched Session:", session);

    if (!session?.user?.email) {
      console.log("⛔ Session missing user data. Returning unauthorized.");
      return NextResponse.json({ error: "Unauthorized, session data missing" }, { status: 401 });
    }

    // Step 2: Fetch the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      console.log("⛔ User not found for email:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;
    console.log("🔹 Fetched User ID:", userId);

    // Step 3: Parse request body
    const bodyText = await req.text();
    console.log("🔹 Raw request body:", bodyText);

    if (!bodyText) {
      console.log("⛔ Request body is missing.");
      return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
    }

    let isusuId: string | undefined;
    try {
      const body = JSON.parse(bodyText);
      isusuId = body.groupId;
      console.log("🔹 Parsed groupId:", isusuId);
    } catch (err) {
      console.log("⛔ Error parsing JSON:", err);
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    if (!isusuId) {
      console.log("⛔ groupId is required.");
      return NextResponse.json({ error: "groupId is required" }, { status: 400 });
    }

    // Step 4: Fetch Isusu data
    const isusu = await prisma.isusu.findUnique({
      where: { id: isusuId },
      include: { members: true },
    });

    if (!isusu) {
      console.log(`⛔ Isusu not found for ID: ${isusuId}`);
      return NextResponse.json({ error: "Isusu not found" }, { status: 404 });
    }

    console.log("🔹 Found Isusu group:", isusu);

    // Step 5: Check if the user is the creator
    if (isusu.createdById !== userId) {
      console.log(`⛔ User ${userId} is not the owner of Isusu ${isusuId}`);
      return NextResponse.json({ error: "Only the Isusu owner can activate this" }, { status: 403 });
    }

    // Step 6: Update Isusu to activate it
    console.log("🔹 Updating Isusu: setting invite_code to null & activating...");
    const updatedIsusu = await prisma.isusu.update({
      where: { id: isusuId },
      data: { invite_code: undefined, isActive: true, startDate: new Date() },
    });

    console.log("✅ Updated Isusu:", updatedIsusu);

    // Step 7: Determine collection duration
    const isusuDuration: Record<string, number> = {
      daily: 1,
      weekly: 7,
      biweekly: 14,
      monthly: 30,
      quarterly: 90,
      half_year: 180,
      annually: 365,
    };

    const durationDays = isusuDuration[isusu.isusuClass.toLowerCase()];
    if (!durationDays) {
      console.log("⛔ Invalid isusuClass value:", isusu.isusuClass);
      return NextResponse.json({ error: "Invalid isusuClass value" }, { status: 400 });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);
    console.log("🔹 Isusu end date:", endDate);

    // Step 8: Frequency to Cron Expression Mapping
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
      console.log("⛔ Invalid frequency value:", isusu.frequency);
      return NextResponse.json({ error: "Invalid frequency value" }, { status: 400 });
    }

    console.log("🔹 Scheduling job with cron expression:", cronExpression);

    // Step 9: Cancel previous schedules if any
    if (activeSchedules[isusuId]) {
      activeSchedules[isusuId].cancel();
      console.log("🔹 Cancelled previous job for Isusu:", isusuId);
    }

    // Step 10: Schedule new Isusu deductions
    activeSchedules[isusuId] = schedule.scheduleJob(cronExpression, async () => {
      console.log(`🔹 Running Isusu deduction for ${isusuId}`);

      const now = new Date();
      if (now >= endDate) {
        console.log("⛔ Isusu duration has ended. Stopping deductions.");
        activeSchedules[isusuId].cancel();
        delete activeSchedules[isusuId];

        await prisma.isusu.update({
          where: { id: isusuId },
          data: { isActive: false },
        });

        return;
      }

      for (const member of isusu.members) {
        try {
          const wallet = await prisma.wallet.findUnique({
            where: { id: member.userId },
          });

          if (!wallet || wallet.balance < isusu.milestone) {
            console.warn(`⛔ Insufficient balance for user ${member.userId}`);
            continue;
          }

          // Deduct balance
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: isusu.milestone } },
          });

          // Create transaction
          await prisma.transaction.create({
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

          console.log(`✅ Deducted ${isusu.milestone} from user ${member.userId}`);
        } catch (err) {
          console.error(`⛔ Failed to process deduction for user ${member.userId}:`, err);
        }
      }
    });

    console.log("✅ Job scheduled successfully");

    // Step 11: Return updated status
    return NextResponse.json({ isActive: true, endDate }, { status: 200 });
  } catch (error) {
    console.error("⛔ Error activating Isusu:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
