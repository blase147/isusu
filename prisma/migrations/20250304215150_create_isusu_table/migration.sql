-- CreateTable
CREATE TABLE "Isusu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "milestone" DOUBLE PRECISION NOT NULL,
    "class" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Isusu_pkey" PRIMARY KEY ("id")
);
