-- AlterTable
ALTER TABLE "Isusu" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "invite_code" DROP NOT NULL;
