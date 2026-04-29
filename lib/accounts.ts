import type { Prisma } from "@prisma/client";

export type TradingAccountOption = {
  id: string;
  name: string;
  broker: string | null;
  currency: string;
};

export function parseAccountIds(searchParams?: { accountIds?: string | string[] }) {
  const raw = Array.isArray(searchParams?.accountIds) ? searchParams?.accountIds.join(",") : searchParams?.accountIds;
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function buildTradeAccountWhere(userId: string, accountIds: string[]): Prisma.TradeWhereInput {
  return {
    userId,
    ...(accountIds.length > 0 ? { tradingAccountId: { in: accountIds } } : {})
  };
}

export function buildInsightAccountWhere(userId: string, accountIds: string[]): Prisma.AIInsightWhereInput {
  return {
    userId,
    ...(accountIds.length > 0
      ? {
          OR: [{ accountIds: { isEmpty: true } }, { accountIds: { hasSome: accountIds } }]
        }
      : {})
  };
}

export function accountNameById(accounts: TradingAccountOption[], accountId: string) {
  return accounts.find((account) => account.id === accountId)?.name ?? null;
}
