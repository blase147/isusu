/*
  Warnings:

  - You are about to drop the column `group_id` on the `IsusuMembers` table. All the data in the column will be lost.
  - You are about to drop the column `joined_at` on the `IsusuMembers` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `IsusuMembers` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Isusu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isusuId` to the `IsusuMembers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `IsusuMembers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IsusuMembers" DROP CONSTRAINT "IsusuMembers_group_id_fkey";

-- DropForeignKey
ALTER TABLE "IsusuMembers" DROP CONSTRAINT "IsusuMembers_user_id_fkey";

-- DropIndex
DROP INDEX "User_id_key";

-- AlterTable
ALTER TABLE "Isusu" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "IsusuMembers" DROP COLUMN "group_id",
DROP COLUMN "joined_at",
DROP COLUMN "user_id",
ADD COLUMN     "isusuId" TEXT NOT NULL,
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Isusu" ADD CONSTRAINT "Isusu_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IsusuMembers" ADD CONSTRAINT "IsusuMembers_isusuId_fkey" FOREIGN KEY ("isusuId") REFERENCES "Isusu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IsusuMembers" ADD CONSTRAINT "IsusuMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
