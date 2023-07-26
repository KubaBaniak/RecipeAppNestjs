/*
  Warnings:

  - You are about to drop the column `imagesUrls` on the `Recipe` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageKeys]` on the table `Recipe` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Recipe_imagesUrls_key";

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "imagesUrls",
ADD COLUMN     "imageKeys" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_imageKeys_key" ON "Recipe"("imageKeys");
