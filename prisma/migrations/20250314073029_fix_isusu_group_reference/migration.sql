/*
  Warnings:

  - You are about to drop the column `isusuGroupId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `isusuGroupId` on the `TransactionTimeline` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_isusuGroupId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionTimeline" DROP CONSTRAINT "TransactionTimeline_isusuGroupId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "isusuGroupId",
ADD COLUMN     "isusuId" TEXT;

-- AlterTable
ALTER TABLE "TransactionTimeline" DROP COLUMN "isusuGroupId",
ADD COLUMN     "isusuId" TEXT;

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "isusuId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_isusuId_fkey" FOREIGN KEY ("isusuId") REFERENCES "Isusu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTimeline" ADD CONSTRAINT "TransactionTimeline_isusuId_fkey" FOREIGN KEY ("isusuId") REFERENCES "Isusu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_isusuId_fkey" FOREIGN KEY ("isusuId") REFERENCES "Isusu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
