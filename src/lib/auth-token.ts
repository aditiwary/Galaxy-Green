import crypto from "node:crypto";

const SECRET = process.env["ADMIN_SESSION_SECRET"] || "gg_dealer_session_secret_2026_secured";

/**
 * Generates a tamper-proof HMAC admin session token valid for 24 hours.
 */
export function generateAdminToken(): string {
  const timestamp = Date.now();
  const hash = crypto.createHmac("sha256", SECRET).update(`admin_${timestamp}`).digest("hex");
  return `${timestamp}_${hash}`;
}

/**
 * Verifies the validity, expiration, and cryptographic signature of an admin session token.
 */
export function verifyAdminToken(token?: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split("_");
  if (parts.length !== 2) return false;
  const [timeStr, expectedHash] = parts;
  if (!timeStr || !expectedHash) return false;
  const time = parseInt(timeStr, 10);
  // Valid for 24 hours
  if (isNaN(time) || Date.now() - time > 24 * 60 * 60 * 1000) return false;
  const actualHash = crypto.createHmac("sha256", SECRET).update(`admin_${timeStr}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash));
  } catch {
    return false;
  }
}

/**
 * Signs a bcrypt PIN hash with server HMAC to allow secure client-side persistence
 * across stateless serverless instances when an external database is offline.
 */
export function signPinHash(bcryptHash: string): string {
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`pinhash_${bcryptHash}`)
    .digest("hex");
  const payload = Buffer.from(bcryptHash).toString("base64url");
  return `${payload}.${signature}`;
}

/**
 * Validates a signed PIN hash token and returns the verified bcrypt hash.
 * Returns null if the signature is invalid or tampered.
 */
export function verifySignedPinHash(token?: string): string | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;
  try {
    const bcryptHash = Buffer.from(payload, "base64url").toString("utf-8");
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(`pinhash_${bcryptHash}`)
      .digest("hex");
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return bcryptHash;
    }
  } catch {
    return null;
  }
  return null;
}
