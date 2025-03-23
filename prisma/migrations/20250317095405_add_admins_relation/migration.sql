/*
  Warnings:

  - You are about to drop the column `admins` on the `Isusu` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Isusu" DROP COLUMN "admins";

-- CreateTable
CREATE TABLE "_IsusuAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_IsusuAdmins_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_IsusuAdmins_B_index" ON "_IsusuAdmins"("B");

-- AddForeignKey
ALTER TABLE "_IsusuAdmins" ADD CONSTRAINT "_IsusuAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "Isusu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IsusuAdmins" ADD CONSTRAINT "_IsusuAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
