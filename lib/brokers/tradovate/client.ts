import type { BrokerEnvironment } from "@prisma/client";

import { getTradovateBaseUrl } from "@/lib/brokers/tradovate/config";

export type TradovateAccount = {
  id: number;
  name?: string;
  accountSpec?: string;
  nickname?: string;
  active?: boolean;
  archived?: boolean;
};

export type TradovateFill = {
  id: number;
  orderId: number;
  contractId: number;
  timestamp: string;
  action: "Buy" | "Sell";
  qty: number;
  price: number;
  active?: boolean;
  finallyPaired?: number;
};

export type TradovateFillPair = {
  id: number;
  positionId: number;
  buyFillId: number;
  sellFillId: number;
  qty: number;
  buyPrice: number;
  sellPrice: number;
  active?: boolean;
};

export type TradovateContract = {
  id: number;
  name?: string;
  symbol?: string;
  description?: string;
};

export type TradovateOrder = {
  id: number;
  accountId?: number;
  contractId?: number;
  timestamp?: string;
  action?: "Buy" | "Sell";
};

export type TradovateMe = {
  userId?: number;
  id?: number;
  name?: string;
  fullName?: string;
  email?: string;
};

async function tradovateRequest<T>(
  environment: BrokerEnvironment,
  accessToken: string,
  path: string,
  init?: RequestInit
) {
  const response = await fetch(`${getTradovateBaseUrl(environment)}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tradovate ${path} failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

export async function getTradovateMe(environment: BrokerEnvironment, accessToken: string) {
  return tradovateRequest<TradovateMe>(environment, accessToken, "/auth/me");
}

export async function listTradovateAccounts(environment: BrokerEnvironment, accessToken: string) {
  return tradovateRequest<TradovateAccount[]>(environment, accessToken, "/account/list");
}

export async function listTradovateFills(environment: BrokerEnvironment, accessToken: string) {
  return tradovateRequest<TradovateFill[]>(environment, accessToken, "/fill/list");
}

export async function listTradovateFillPairs(environment: BrokerEnvironment, accessToken: string) {
  return tradovateRequest<TradovateFillPair[]>(environment, accessToken, "/fillPair/list");
}

export async function listTradovateOrders(environment: BrokerEnvironment, accessToken: string) {
  return tradovateRequest<TradovateOrder[]>(environment, accessToken, "/order/list");
}

export async function getTradovateContracts(
  environment: BrokerEnvironment,
  accessToken: string,
  ids: number[]
) {
  if (ids.length === 0) return [];
  const params = new URLSearchParams();
  params.set("ids", ids.join(","));
  return tradovateRequest<TradovateContract[]>(environment, accessToken, `/contract/items?${params}`);
}
