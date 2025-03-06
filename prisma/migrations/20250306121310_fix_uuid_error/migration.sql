/*
  Warnings:

  - The primary key for the `Isusu` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `IsusuMembers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "IsusuMembers" DROP CONSTRAINT "IsusuMembers_group_id_fkey";

-- DropForeignKey
ALTER TABLE "IsusuMembers" DROP CONSTRAINT "IsusuMembers_user_id_fkey";

-- AlterTable
ALTER TABLE "Isusu" DROP CONSTRAINT "Isusu_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Isusu_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "IsusuMembers" DROP CONSTRAINT "IsusuMembers_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "group_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "IsusuMembers_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_id_key" ON "Users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "IsusuMembers" ADD CONSTRAINT "IsusuMembers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Isusu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IsusuMembers" ADD CONSTRAINT "IsusuMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
