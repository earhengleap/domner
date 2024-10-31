-- AlterTable
ALTER TABLE "GuideProfile" ADD COLUMN     "facebookLink" TEXT,
ADD COLUMN     "telegramLink" TEXT,
ADD COLUMN     "tiktokLink" TEXT,
ADD COLUMN     "twitterLink" TEXT;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "guidePostId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_guidePostId_fkey" FOREIGN KEY ("guidePostId") REFERENCES "GuidePost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
