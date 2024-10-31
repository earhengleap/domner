/*
  Warnings:

  - You are about to drop the column `location` on the `GuideProfile` table. All the data in the column will be lost.
  - You are about to drop the column `organizationName` on the `GuideProfile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `GuideProfile` table. All the data in the column will be lost.
  - Added the required column `description` to the `GuideProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `GuideProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `GuideProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `GuideProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `GuideProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `GuideProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GuideProfile" DROP COLUMN "location",
DROP COLUMN "organizationName",
DROP COLUMN "phone",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
