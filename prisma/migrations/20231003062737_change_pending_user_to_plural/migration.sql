/*
  Warnings:

  - You are about to drop the `PendingUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PendingUser";

-- CreateTable
CREATE TABLE "PendingUsers" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "accountActivationToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingUsers_email_key" ON "PendingUsers"("email");
