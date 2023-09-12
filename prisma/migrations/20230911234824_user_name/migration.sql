/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ArtistFollow" DROP CONSTRAINT "ArtistFollow_userId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "ArtistFollow" ADD CONSTRAINT "ArtistFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
