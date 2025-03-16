/*
  Warnings:

  - Added the required column `tier` to the `Isusu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Isusu" ADD COLUMN     "tier" TEXT NOT NULL;
