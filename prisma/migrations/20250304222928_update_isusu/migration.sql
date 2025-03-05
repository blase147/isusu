/*
  Warnings:

  - You are about to drop the column `class` on the `Isusu` table. All the data in the column will be lost.
  - Added the required column `isusuClass` to the `Isusu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Isusu" DROP COLUMN "class",
ADD COLUMN     "isusuClass" TEXT NOT NULL;
