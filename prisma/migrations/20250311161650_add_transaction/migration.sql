-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_recipientId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "isIsusu" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isusuGroupId" TEXT,
ALTER COLUMN "recipientId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TransactionTimeline" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isusuGroupId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "TransactionTimeline_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_isusuGroupId_fkey" FOREIGN KEY ("isusuGroupId") REFERENCES "Isusu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTimeline" ADD CONSTRAINT "TransactionTimeline_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTimeline" ADD CONSTRAINT "TransactionTimeline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTimeline" ADD CONSTRAINT "TransactionTimeline_isusuGroupId_fkey" FOREIGN KEY ("isusuGroupId") REFERENCES "Isusu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
