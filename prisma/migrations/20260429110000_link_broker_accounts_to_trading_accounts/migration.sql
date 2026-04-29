ALTER TABLE "BrokerAccount" ADD COLUMN "tradingAccountId" TEXT;

UPDATE "BrokerAccount"
SET "tradingAccountId" = "TradingAccount"."id"
FROM "TradingAccount"
WHERE "BrokerAccount"."userId" = "TradingAccount"."userId"
  AND "BrokerAccount"."name" = "TradingAccount"."name";

ALTER TABLE "BrokerAccount" ADD CONSTRAINT "BrokerAccount_tradingAccountId_fkey"
  FOREIGN KEY ("tradingAccountId") REFERENCES "TradingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "BrokerAccount_userId_tradingAccountId_idx" ON "BrokerAccount"("userId", "tradingAccountId");
