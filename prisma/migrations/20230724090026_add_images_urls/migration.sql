/*
  Warnings:

  - A unique constraint covering the columns `[imagesUrls]` on the table `Recipe` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "imagesUrls" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_imagesUrls_key" ON "Recipe"("imagesUrls");
