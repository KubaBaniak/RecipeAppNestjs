/*
  Warnings:

  - You are about to drop the `PTA` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PTA" DROP CONSTRAINT "PTA_userId_fkey";

-- DropTable
DROP TABLE "PTA";

-- CreateTable
CREATE TABLE "PAT" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "invalidatedAt" TIMESTAMP(3),

    CONSTRAINT "PAT_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PAT_userId_key" ON "PAT"("userId");

-- AddForeignKey
ALTER TABLE "PAT" ADD CONSTRAINT "PAT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
