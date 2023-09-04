-- CreateTable
CREATE TABLE "PTA" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "invalidatedAt" TIMESTAMP(3),

    CONSTRAINT "PTA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PTA_userId_key" ON "PTA"("userId");

-- AddForeignKey
ALTER TABLE "PTA" ADD CONSTRAINT "PTA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
