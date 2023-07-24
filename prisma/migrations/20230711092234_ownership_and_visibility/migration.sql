/*
  Warnings:

  - Added the required column `authorId` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Recipe` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "description" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
