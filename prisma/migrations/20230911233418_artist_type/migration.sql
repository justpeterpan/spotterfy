/*
  Warnings:

  - The primary key for the `ArtistFollow` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "ArtistFollow" DROP CONSTRAINT "ArtistFollow_artistId_fkey";

-- DropForeignKey
ALTER TABLE "Release" DROP CONSTRAINT "Release_artistId_fkey";

-- AlterTable
ALTER TABLE "ArtistFollow" DROP CONSTRAINT "ArtistFollow_pkey",
ALTER COLUMN "artistId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ArtistFollow_pkey" PRIMARY KEY ("userId", "artistId");

-- AlterTable
ALTER TABLE "Release" ALTER COLUMN "artistId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("spotifyArtistId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistFollow" ADD CONSTRAINT "ArtistFollow_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("spotifyArtistId") ON DELETE RESTRICT ON UPDATE CASCADE;
