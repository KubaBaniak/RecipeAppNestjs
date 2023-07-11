/*
  Warnings:

  - You are about to drop the column `public` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "public",
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;
