/*
  Warnings:

  - The primary key for the `Artist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Artist` table. All the data in the column will be lost.
  - The primary key for the `Release` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Release` table. All the data in the column will be lost.
  - Added the required column `spotifyReleaseId` to the `Release` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Artist" DROP CONSTRAINT "Artist_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Artist_pkey" PRIMARY KEY ("spotifyArtistId");

-- AlterTable
ALTER TABLE "Release" DROP CONSTRAINT "Release_pkey",
DROP COLUMN "id",
ADD COLUMN     "spotifyReleaseId" TEXT NOT NULL,
ADD CONSTRAINT "Release_pkey" PRIMARY KEY ("spotifyReleaseId");
