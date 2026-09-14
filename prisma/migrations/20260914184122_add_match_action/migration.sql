-- CreateEnum
CREATE TYPE "MatchActionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "MatchAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetUserId" INTEGER NOT NULL,
    "action" "MatchActionType" NOT NULL,
    "isMatch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchAction_userId_idx" ON "MatchAction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchAction_userId_targetUserId_key" ON "MatchAction"("userId", "targetUserId");
