/*
  Warnings:

  - You are about to alter the column `amount` on the `IsusuPurchase` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - Added the required column `isusuId` to the `IsusuPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paystackReference` to the `IsusuPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Isusu" ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "IsusuPurchase" ADD COLUMN     "isusuId" TEXT NOT NULL,
ADD COLUMN     "paystackReference" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AddForeignKey
ALTER TABLE "IsusuPurchase" ADD CONSTRAINT "IsusuPurchase_isusuId_fkey" FOREIGN KEY ("isusuId") REFERENCES "Isusu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
