/*
  Warnings:

  - A unique constraint covering the columns `[invite_code]` on the table `Isusu` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invite_code` to the `Isusu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Isusu" ADD COLUMN     "invite_code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Isusu_invite_code_key" ON "Isusu"("invite_code");
