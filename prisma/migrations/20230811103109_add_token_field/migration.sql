/*
  Warnings:

  - Added the required column `token` to the `PAT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PAT" ADD COLUMN     "token" TEXT NOT NULL;
