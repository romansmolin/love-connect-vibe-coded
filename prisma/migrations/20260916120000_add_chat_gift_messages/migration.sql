-- Keep text sends and in-chat gift purchases idempotent, and attach gifts to
-- the local simulated timeline so they can be rendered as first-class messages.
ALTER TABLE "GiftTransaction" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "SimulatedMessage" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "SimulatedMessage" ADD COLUMN "giftTransactionId" TEXT;

CREATE UNIQUE INDEX "GiftTransaction_senderId_idempotencyKey_key"
ON "GiftTransaction"("senderId", "idempotencyKey");

CREATE UNIQUE INDEX "SimulatedMessage_giftTransactionId_key"
ON "SimulatedMessage"("giftTransactionId");

CREATE UNIQUE INDEX "SimulatedMessage_appUserId_personaId_idempotencyKey_key"
ON "SimulatedMessage"("appUserId", "personaId", "idempotencyKey");

ALTER TABLE "SimulatedMessage"
ADD CONSTRAINT "SimulatedMessage_giftTransactionId_fkey"
FOREIGN KEY ("giftTransactionId") REFERENCES "GiftTransaction"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
