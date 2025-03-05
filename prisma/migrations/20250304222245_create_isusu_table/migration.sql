/*
  Warnings:

  - You are about to drop the column `name` on the `Isusu` table. All the data in the column will be lost.
  - Added the required column `isusuName` to the `Isusu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Isusu" DROP COLUMN "name",
ADD COLUMN     "isusuName" TEXT NOT NULL;
