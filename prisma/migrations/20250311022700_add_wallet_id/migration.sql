/*
  Warnings:

  - You are about to drop the column `isusuId` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Wallet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[walletId]` on the table `Isusu` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[walletId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_isusuId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropIndex
DROP INDEX "Wallet_isusuId_key";

-- DropIndex
DROP INDEX "Wallet_userId_key";

-- AlterTable
ALTER TABLE "Isusu" ADD COLUMN     "walletId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "walletId" TEXT;

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "isusuId",
DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Isusu_walletId_key" ON "Isusu"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletId_key" ON "User"("walletId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Isusu" ADD CONSTRAINT "Isusu_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
