-- CreateEnum
CREATE TYPE "SimulatedMatchKind" AS ENUM ('LIKE', 'MUTUAL_MATCH');

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulatedPersona" (
    "id" TEXT NOT NULL,
    "fotochatUserId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "age" INTEGER,
    "location" TEXT,
    "gender" TEXT,
    "photoUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulatedPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulatedMatch" (
    "id" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "kind" "SimulatedMatchKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulatedMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulatedMessage" (
    "id" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "senderIsPersona" BOOLEAN NOT NULL,
    "text" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledReplyAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),

    CONSTRAINT "SimulatedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SimulatedPersona_fotochatUserId_key" ON "SimulatedPersona"("fotochatUserId");

-- CreateIndex
CREATE INDEX "SimulatedMatch_appUserId_kind_createdAt_idx" ON "SimulatedMatch"("appUserId", "kind", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "SimulatedMatch_appUserId_personaId_kind_key" ON "SimulatedMatch"("appUserId", "personaId", "kind");

-- CreateIndex
CREATE INDEX "SimulatedMessage_appUserId_personaId_sentAt_idx" ON "SimulatedMessage"("appUserId", "personaId", "sentAt");

-- CreateIndex
CREATE INDEX "SimulatedMessage_senderIsPersona_scheduledReplyAt_repliedAt_idx" ON "SimulatedMessage"("senderIsPersona", "scheduledReplyAt", "repliedAt");
