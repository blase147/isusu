import { Queue, Worker } from "bullmq";
import { PrismaClient } from "@prisma/client";
import redisClient from "./redis"; // Import shared Redis client

const prisma = new PrismaClient();

// Use the shared Redis client for BullMQ
export const deductionQueue = new Queue("deductionQueue", { connection: redisClient });

new Worker(
  "deductionQueue",
  async (job) => {
    const { userId, isusuId, amount } = job.data;

    try {
      // Fetch Wallet
      const wallet = await prisma.wallet.findUnique({ where: { id: userId } });
      if (!wallet || wallet.balance < amount) throw new Error("Insufficient funds");

      // Deduct balance
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      // Log Transaction
      await prisma.transaction.create({
        data: {
          senderId: userId,
          isusuId: isusuId,
          amount,
          type: "WITHDRAWAL",
          status: "SUCCESS",
          reference: `ISUSU_${isusuId}_${Date.now()}`,
          description: `Isusu deduction`,
          isIsusu: true,
        },
      });

      console.log(`Deduction successful for user ${userId}`);
    } catch (error) {
      console.error(`Deduction failed for user ${userId}:`, error);
    }
  },
  { connection: redisClient }
);
