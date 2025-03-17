-- AlterTable
ALTER TABLE "Isusu" ADD COLUMN     "admins" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "ownerId" TEXT;
