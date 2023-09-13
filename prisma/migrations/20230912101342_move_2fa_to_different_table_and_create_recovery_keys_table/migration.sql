/*
  Warnings:

  - You are about to drop the column `enabled2FA` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `recoveryKeys` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "enabled2FA",
DROP COLUMN "recoveryKeys";

-- CreateTable
CREATE TABLE "TwoFactorAuth" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "secretKey" TEXT NOT NULL,

    CONSTRAINT "TwoFactorAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactorAuthRecoveryKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "twoFactorAuthId" INTEGER NOT NULL,

    CONSTRAINT "TwoFactorAuthRecoveryKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorAuth_userId_key" ON "TwoFactorAuth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorAuthRecoveryKey_key_key" ON "TwoFactorAuthRecoveryKey"("key");

-- AddForeignKey
ALTER TABLE "TwoFactorAuth" ADD CONSTRAINT "TwoFactorAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactorAuthRecoveryKey" ADD CONSTRAINT "TwoFactorAuthRecoveryKey_twoFactorAuthId_fkey" FOREIGN KEY ("twoFactorAuthId") REFERENCES "TwoFactorAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
