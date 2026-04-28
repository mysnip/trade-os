import { createHash, randomBytes } from "crypto";

export const defaultInviteExpiryDays = 7;

export function createInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getInviteExpiry(days = defaultInviteExpiryDays) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

export function buildInviteUrl(baseUrl: string, token: string) {
  return new URL(`/invite/${token}`, baseUrl).toString();
}
