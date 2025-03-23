/*
  Warnings:

  - A unique constraint covering the columns `[walletId]` on the table `Isusu` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Isusu" ADD COLUMN     "walletId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Isusu_walletId_key" ON "Isusu"("walletId");

-- AddForeignKey
ALTER TABLE "Isusu" ADD CONSTRAINT "Isusu_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
