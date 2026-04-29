-- First-class trading accounts for filtering, imports, and journal assignment.
CREATE TABLE "TradingAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "broker" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TradingAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TradingAccount_userId_name_key" ON "TradingAccount"("userId", "name");
CREATE INDEX "TradingAccount_userId_createdAt_idx" ON "TradingAccount"("userId", "createdAt");

ALTER TABLE "TradingAccount" ADD CONSTRAINT "TradingAccount_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Trade" ADD COLUMN "tradingAccountId" TEXT;
ALTER TABLE "ImportJob" ADD COLUMN "tradingAccountId" TEXT;

INSERT INTO "TradingAccount" ("id", "userId", "name", "broker", "currency", "createdAt", "updatedAt")
SELECT
  'ta_' || substr(md5("userId" || ':' || account_name), 1, 24),
  "userId",
  account_name,
  MIN("broker"),
  'USD',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT
    "userId",
    COALESCE(NULLIF(trim("accountName"), ''), 'Default') AS account_name,
    "broker"
  FROM "Trade"
) existing_accounts
GROUP BY "userId", account_name
ON CONFLICT ("userId", "name") DO NOTHING;

UPDATE "Trade"
SET "tradingAccountId" = "TradingAccount"."id"
FROM "TradingAccount"
WHERE "Trade"."userId" = "TradingAccount"."userId"
  AND COALESCE(NULLIF(trim("Trade"."accountName"), ''), 'Default') = "TradingAccount"."name";

ALTER TABLE "Trade" ADD CONSTRAINT "Trade_tradingAccountId_fkey"
  FOREIGN KEY ("tradingAccountId") REFERENCES "TradingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_tradingAccountId_fkey"
  FOREIGN KEY ("tradingAccountId") REFERENCES "TradingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Trade_userId_tradingAccountId_idx" ON "Trade"("userId", "tradingAccountId");
CREATE INDEX "ImportJob_userId_tradingAccountId_idx" ON "ImportJob"("userId", "tradingAccountId");
