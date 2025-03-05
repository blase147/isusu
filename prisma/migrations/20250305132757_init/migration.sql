-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Isusu" (
    "id" UUID NOT NULL,
    "isusuName" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "milestone" DOUBLE PRECISION NOT NULL,
    "isusuClass" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Isusu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IsusuMembers" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IsusuMembers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "IsusuMembers" ADD CONSTRAINT "IsusuMembers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Isusu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IsusuMembers" ADD CONSTRAINT "IsusuMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
