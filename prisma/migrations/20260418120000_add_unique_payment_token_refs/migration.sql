-- Enforce one fulfillment row per PaymentToken to prevent double-credit on webhook replay

DROP INDEX IF EXISTS "GiftTransaction_paymentTokenId_idx";
DROP INDEX IF EXISTS "CreditTransaction_paymentTokenId_idx";

CREATE UNIQUE INDEX "PaymentToken_gatewayUid_key" ON "PaymentToken"("gatewayUid");
CREATE UNIQUE INDEX "GiftTransaction_paymentTokenId_key" ON "GiftTransaction"("paymentTokenId");
CREATE UNIQUE INDEX "CreditTransaction_paymentTokenId_key" ON "CreditTransaction"("paymentTokenId");
