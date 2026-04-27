import type { BrokerConnection } from "@prisma/client";

import {
  getTradovateBaseUrl,
  getTradovateClientCredentials,
  getTradovateEnvironment,
  getTradovateOAuthUrl,
  getTradovateRedirectUri
} from "@/lib/brokers/tradovate/config";
import { decryptSecret, encryptSecret } from "@/lib/brokers/tradovate/crypto";
import { getTradovateMe, listTradovateAccounts } from "@/lib/brokers/tradovate/client";
import { prisma } from "@/lib/prisma";

type TokenResponse = {
  access_token?: string;
  accessToken?: string;
  token_type?: string;
  expires_in?: number;
  expirationTime?: string;
  error?: string;
  error_description?: string;
};

export function buildTradovateAuthorizationUrl(state: string) {
  const { clientId } = getTradovateClientCredentials();
  const url = new URL(getTradovateOAuthUrl());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getTradovateRedirectUri());
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeTradovateCode(code: string) {
  const { clientId, clientSecret } = getTradovateClientCredentials();
  const environment = getTradovateEnvironment();
  const response = await fetch(`${getTradovateBaseUrl(environment)}/auth/oauthtoken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getTradovateRedirectUri(),
      code
    }),
    cache: "no-store"
  });

  const token = (await response.json()) as TokenResponse;
  if (!response.ok || token.error || (!token.access_token && !token.accessToken)) {
    throw new Error(token.error_description ?? token.error ?? "Tradovate OAuth token exchange failed.");
  }
  return normalizeTokenResponse(token);
}

export async function upsertTradovateConnection(userId: string, token: ReturnType<typeof normalizeTokenResponse>) {
  const environment = getTradovateEnvironment();
  const accessToken = token.accessToken;
  const me = await getTradovateMe(environment, accessToken);

  const connection = await prisma.brokerConnection.upsert({
    where: {
      userId_provider_environment: {
        userId,
        provider: "TRADOVATE",
        environment
      }
    },
    create: {
      userId,
      provider: "TRADOVATE",
      environment,
      status: "CONNECTED",
      externalUserId: String(me.userId ?? me.id ?? ""),
      accessToken: encryptSecret(accessToken),
      tokenType: token.tokenType,
      expiresAt: token.expiresAt,
      lastTokenRefreshAt: new Date(),
      metadata: me
    },
    update: {
      status: "CONNECTED",
      externalUserId: String(me.userId ?? me.id ?? ""),
      accessToken: encryptSecret(accessToken),
      tokenType: token.tokenType,
      expiresAt: token.expiresAt,
      lastTokenRefreshAt: new Date(),
      error: null,
      metadata: me
    }
  });

  await refreshTradovateAccounts(connection.id);
  return connection;
}

export async function refreshTradovateAccounts(connectionId: string) {
  const connection = await prisma.brokerConnection.findUniqueOrThrow({
    where: { id: connectionId }
  });
  const accessToken = decryptSecret(connection.accessToken);
  const accounts = await listTradovateAccounts(connection.environment, accessToken);

  for (const account of accounts) {
    const externalAccountId = String(account.id);
    await prisma.brokerAccount.upsert({
      where: {
        connectionId_externalAccountId: {
          connectionId: connection.id,
          externalAccountId
        }
      },
      create: {
        userId: connection.userId,
        connectionId: connection.id,
        provider: "TRADOVATE",
        externalAccountId,
        name: account.nickname ?? account.name ?? account.accountSpec ?? `Account ${externalAccountId}`,
        accountSpec: account.accountSpec ?? account.name ?? null,
        enabled: false,
        metadata: account
      },
      update: {
        name: account.nickname ?? account.name ?? account.accountSpec ?? `Account ${externalAccountId}`,
        accountSpec: account.accountSpec ?? account.name ?? null,
        metadata: account
      }
    });
  }

  return accounts;
}

export async function renewTradovateConnectionToken(connection: BrokerConnection) {
  const accessToken = decryptSecret(connection.accessToken);
  const response = await fetch(`${getTradovateBaseUrl(connection.environment)}/auth/renewaccesstoken`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  const token = (await response.json()) as TokenResponse;
  if (!response.ok || (!token.accessToken && !token.access_token)) {
    await prisma.brokerConnection.update({
      where: { id: connection.id },
      data: {
        status: "NEEDS_REAUTH",
        error: token.error_description ?? token.error ?? "Tradovate token renewal failed."
      }
    });
    throw new Error(token.error_description ?? token.error ?? "Tradovate token renewal failed.");
  }

  const normalized = normalizeTokenResponse(token);
  return prisma.brokerConnection.update({
    where: { id: connection.id },
    data: {
      status: "CONNECTED",
      accessToken: encryptSecret(normalized.accessToken),
      tokenType: normalized.tokenType,
      expiresAt: normalized.expiresAt,
      lastTokenRefreshAt: new Date(),
      error: null
    }
  });
}

export async function ensureTradovateAccessToken(connection: BrokerConnection) {
  const refreshAt = new Date(Date.now() + 15 * 60 * 1000);
  if (connection.expiresAt <= refreshAt) {
    const renewed = await renewTradovateConnectionToken(connection);
    return decryptSecret(renewed.accessToken);
  }
  return decryptSecret(connection.accessToken);
}

function normalizeTokenResponse(token: TokenResponse) {
  const accessToken = token.access_token ?? token.accessToken;
  if (!accessToken) throw new Error("Tradovate token response did not include an access token.");

  return {
    accessToken,
    tokenType: token.token_type ?? "Bearer",
    expiresAt: token.expirationTime
      ? new Date(token.expirationTime)
      : new Date(Date.now() + (token.expires_in ?? 90 * 60) * 1000)
  };
}
