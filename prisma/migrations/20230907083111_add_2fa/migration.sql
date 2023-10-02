-- AlterTable
ALTER TABLE "User" ADD COLUMN     "enabled2FA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recoveryKeys" TEXT[];
