/*
  Warnings:

  - You are about to drop the column `token2FA` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "token2FA";
