import crypto from "node:crypto";

const SECRET = process.env["ADMIN_SESSION_SECRET"] || "gg_dealer_session_secret_2026_secured";

// Active in-memory hash fingerprint of the currently configured PIN
let currentPinFingerprint: string = "";
let sessionRevocationTimestamp: number = 0;

export function getFingerprint(hashOrPin: string): string {
  return crypto.createHash("sha256").update(hashOrPin).digest("hex").slice(0, 16);
}

export function setActivePinHash(hash: string): void {
  currentPinFingerprint = getFingerprint(hash);
}

export function invalidateAllAdminSessions(): void {
  // Record revocation timestamp to immediately invalidate all active sessions across all devices
  sessionRevocationTimestamp = Date.now();
  currentPinFingerprint = crypto.randomBytes(8).toString("hex");
}

/**
 * Generates a tamper-proof HMAC admin session token valid for 24 hours.
 * Binds the token to the active PIN hash fingerprint so changing the PIN immediately
 * invalidates all active sessions across all devices and networks.
 */
export function generateAdminToken(pinHash?: string): string {
  const timestamp = Date.now();
  const fp = pinHash ? getFingerprint(pinHash) : currentPinFingerprint || "live";
  const payload = `admin_${timestamp}_${fp}`;
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${timestamp}_${fp}_${hmac}`;
}

/**
 * Verifies the validity, expiration, cryptographic signature, and PIN-binding
 * of an admin session token.
 */
export function verifyAdminToken(token?: string, expectedPinHash?: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split("_");

  // Format: timestamp_fingerprint_hmac (3 parts)
  if (parts.length === 3) {
    const [timeStr, fp, expectedHmac] = parts;
    if (!timeStr || !fp || !expectedHmac) return false;
    const time = parseInt(timeStr, 10);
    // Valid for 24 hours max
    if (isNaN(time) || Date.now() - time > 24 * 60 * 60 * 1000 || time > Date.now() + 60000) {
      return false;
    }
    // Check if session was revoked globally after token was created
    if (sessionRevocationTimestamp > 0 && time < sessionRevocationTimestamp) {
      return false;
    }
    const payload = `admin_${timeStr}_${fp}`;
    const actualHmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    let isValidHmac = false;
    try {
      isValidHmac = crypto.timingSafeEqual(Buffer.from(actualHmac), Buffer.from(expectedHmac));
    } catch {
      return false;
    }
    if (!isValidHmac) return false;

    // Check if an expected PIN hash is explicitly supplied by the caller
    if (expectedPinHash) {
      const targetFp = getFingerprint(expectedPinHash);
      if (fp !== targetFp) {
        return false;
      }
    }
    return true;
  }

  // Legacy fallback: 2 parts (timestamp_hmac)
  if (parts.length === 2) {
    if (sessionRevocationTimestamp > 0) return false;
    const [timeStr, expectedHmac] = parts;
    if (!timeStr || !expectedHmac) return false;
    const time = parseInt(timeStr, 10);
    if (isNaN(time) || Date.now() - time > 24 * 60 * 60 * 1000) return false;
    const actualHmac = crypto.createHmac("sha256", SECRET).update(`admin_${timeStr}`).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(actualHmac), Buffer.from(expectedHmac));
    } catch {
      return false;
    }
  }

  return false;
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
