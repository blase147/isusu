-- CreateTable
CREATE TABLE "IsusuDues" (
    "id" TEXT NOT NULL,
    "isusuId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IsusuDues_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IsusuDues" ADD CONSTRAINT "IsusuDues_isusuId_fkey" FOREIGN KEY ("isusuId") REFERENCES "Isusu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IsusuDues" ADD CONSTRAINT "IsusuDues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
