/*
  Warnings:

  - You are about to drop the `PAT` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PAT" DROP CONSTRAINT "PAT_userId_fkey";

-- DropTable
DROP TABLE "PAT";

-- CreateTable
CREATE TABLE "PersonalAccessToken" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "invalidatedAt" TIMESTAMP(3),

    CONSTRAINT "PersonalAccessToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PersonalAccessToken" ADD CONSTRAINT "PersonalAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
