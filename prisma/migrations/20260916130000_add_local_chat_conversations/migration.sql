CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "peerDatingId" INTEGER NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "lastReadAt" TIMESTAMP(3),
    "unlockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatMessageRecord" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderDatingId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "giftId" TEXT,
    "giftTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),

    CONSTRAINT "ChatMessageRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChatConversation_userId_peerDatingId_key"
ON "ChatConversation"("userId", "peerDatingId");
CREATE INDEX "ChatConversation_userId_lastMessageAt_idx"
ON "ChatConversation"("userId", "lastMessageAt" DESC);
CREATE UNIQUE INDEX "ChatMessageRecord_conversationId_idempotencyKey_key"
ON "ChatMessageRecord"("conversationId", "idempotencyKey");
CREATE UNIQUE INDEX "ChatMessageRecord_giftTransactionId_key"
ON "ChatMessageRecord"("giftTransactionId");
CREATE INDEX "ChatMessageRecord_conversationId_createdAt_idx"
ON "ChatMessageRecord"("conversationId", "createdAt");

ALTER TABLE "ChatMessageRecord" ADD CONSTRAINT "ChatMessageRecord_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessageRecord" ADD CONSTRAINT "ChatMessageRecord_giftId_fkey"
FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatMessageRecord" ADD CONSTRAINT "ChatMessageRecord_giftTransactionId_fkey"
FOREIGN KEY ("giftTransactionId") REFERENCES "GiftTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
