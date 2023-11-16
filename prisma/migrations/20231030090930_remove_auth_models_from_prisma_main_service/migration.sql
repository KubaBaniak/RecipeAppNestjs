/*
  Warnings:

  - You are about to drop the `PersonalAccessToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TwoFactorAuth` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TwoFactorAuthRecoveryKey` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PersonalAccessToken" DROP CONSTRAINT "PersonalAccessToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "TwoFactorAuth" DROP CONSTRAINT "TwoFactorAuth_userId_fkey";

-- DropForeignKey
ALTER TABLE "TwoFactorAuthRecoveryKey" DROP CONSTRAINT "TwoFactorAuthRecoveryKey_twoFactorAuthId_fkey";

-- DropTable
DROP TABLE "PersonalAccessToken";

-- DropTable
DROP TABLE "TwoFactorAuth";

-- DropTable
DROP TABLE "TwoFactorAuthRecoveryKey";
