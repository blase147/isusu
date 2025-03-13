import { Worker } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { redisClient } from "../lib/redis"; // Ensure redisClient is correctly imported

// Singleton Prisma Client to avoid multiple connections
const prisma = new PrismaClient();

/**
 * Process deductions for an Isusu group.
 * @param {string} groupId - ID of the Isusu group.
 */
export async function processDeductions(groupId: string) {
  console.log(`💰 Processing deductions for Isusu group: ${groupId}`);

  const group = await prisma.isusu.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: {
            include: {
              wallet: true, // Include wallet through user
            },
          },
        },
      },
      wallet: true, // Ensure Isusu group wallet is included
    },
  });

  if (!group) {
    console.error(`🚨 Isusu group ${groupId} not found!`);
    return;
  }

  for (const member of group.members) {
    if (!member.user?.wallet) continue; // Ensure user and wallet exist

    const amountToDeduct = group.milestone;

    if (member.user.wallet.balance >= amountToDeduct) {
      try {
        await prisma.$transaction([
          prisma.wallet.update({
            where: { id: member.user.wallet.id },
            data: { balance: { decrement: amountToDeduct } },
          }),
          prisma.wallet.update({
            where: { id: group.walletId! },
            data: { balance: { increment: amountToDeduct } },
          }),
          prisma.transaction.create({
            data: {
              amount: amountToDeduct,
              type: "DEDUCTION",
              status: "SUCCESS",
              senderId: member.user.id, // Sender is the user
              recipientId: group.walletId!,
              reference: `ISUSU-${Date.now()}`,
              description: `Scheduled deduction for Isusu group ${group.id}`,
            },
          }),
        ]);
        console.log(`✅ Deducted ${amountToDeduct} from ${member.user.id}`);
      } catch (error) {
        console.error(`❌ Error deducting from ${member.user.id}:`, error);
      }
    } else {
      console.warn(`⚠️ Insufficient funds for ${member.user.id}`);
    }
  }
}

// Register the Deduction Worker
export const deductionWorker = new Worker(
  "queues",
  async (job) => {
    const { userId, isusuId, amount } = job.data;

    console.log(`💰 Processing deduction for user ${userId} in Isusu ${isusuId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user || !user.wallet || user.wallet.balance < amount) {
      console.error("❌ Insufficient balance or user not found");
      return;
    }

    const isusu = await prisma.isusu.findUnique({
      where: { id: isusuId },
      include: { wallet: true },
    });

    if (!isusu || !isusu.wallet) {
      console.error("❌ Isusu group not found or has no wallet");
      return;
    }

    try {
      await prisma.$transaction([
        prisma.wallet.update({
          where: { id: user.wallet.id },
          data: { balance: { decrement: amount } },
        }),
        prisma.wallet.update({
          where: { id: isusu.wallet.id },
          data: { balance: { increment: amount } },
        }),
        prisma.transaction.create({
          data: {
            amount,
            type: "ISUSU_DEDUCTION",
            status: "SUCCESS",
            senderId: user.id,
            recipientId: isusu.wallet.id,
            reference: `ISUSU-${Date.now()}`,
            description: `Automatic deduction for Isusu group ${isusu.id}`,
          },
        }),
      ]);
      console.log(`✅ Deduction successful for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error processing deduction for user ${userId}:`, error);
    }
  },
  { connection: redisClient }
);

console.log("🚀 Deduction worker started!");
