-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountActivationToken" TEXT,
ADD COLUMN     "activated" BOOLEAN NOT NULL DEFAULT false;
