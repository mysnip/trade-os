import type { BrokerEnvironment } from "@prisma/client";

export function getTradovateEnvironment(): BrokerEnvironment {
  return process.env.TRADOVATE_ENVIRONMENT === "DEMO" ? "DEMO" : "LIVE";
}

export function getTradovateBaseUrl(environment = getTradovateEnvironment()) {
  return environment === "DEMO"
    ? "https://demo.tradovateapi.com/v1"
    : "https://live.tradovateapi.com/v1";
}

export function getTradovateOAuthUrl() {
  return process.env.TRADOVATE_AUTH_URL ?? "https://trader.tradovate.com/oauth";
}

export function getTradovateRedirectUri() {
  const configured = process.env.TRADOVATE_REDIRECT_URI;
  if (configured) return configured;
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${baseUrl}/api/brokers/tradovate/callback`;
}

export function getTradovateClientCredentials() {
  const clientId = process.env.TRADOVATE_CLIENT_ID;
  const clientSecret = process.env.TRADOVATE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("TRADOVATE_CLIENT_ID and TRADOVATE_CLIENT_SECRET must be configured.");
  }

  return { clientId, clientSecret };
}
