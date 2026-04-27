import crypto from "crypto";

const algorithm = "aes-256-gcm";

function getEncryptionKey() {
  const raw = process.env.APP_ENCRYPTION_KEY ?? process.env.NEXTAUTH_SECRET;
  if (!raw) {
    throw new Error("APP_ENCRYPTION_KEY or NEXTAUTH_SECRET must be configured for broker token storage.");
  }

  const base64Key = Buffer.from(raw, "base64");
  if (base64Key.length === 32) return base64Key;
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((buffer) => buffer.toString("base64url")).join(".");
}

export function decryptSecret(value: string) {
  const [ivRaw, authTagRaw, encryptedRaw] = value.split(".");
  if (!ivRaw || !authTagRaw || !encryptedRaw) {
    throw new Error("Encrypted secret has an invalid format.");
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    getEncryptionKey(),
    Buffer.from(ivRaw, "base64url")
  );
  decipher.setAuthTag(Buffer.from(authTagRaw, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final()
  ]).toString("utf8");
}
