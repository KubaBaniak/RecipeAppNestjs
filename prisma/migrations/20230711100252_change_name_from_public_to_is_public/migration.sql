/*
  Warnings:

  - You are about to drop the column `public` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" RENAME COLUMN "public" TO "isPublic";
