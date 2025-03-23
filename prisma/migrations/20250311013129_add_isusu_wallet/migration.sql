/*
  Warnings:

  - You are about to drop the column `walletId` on the `Isusu` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[isusuId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Isusu" DROP CONSTRAINT "Isusu_walletId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropIndex
DROP INDEX "Isusu_walletId_key";

-- AlterTable
ALTER TABLE "Isusu" DROP COLUMN "walletId";

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "isusuId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "balance" SET DEFAULT 1000.0;

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_isusuId_key" ON "Wallet"("isusuId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_isusuId_fkey" FOREIGN KEY ("isusuId") REFERENCES "Isusu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
