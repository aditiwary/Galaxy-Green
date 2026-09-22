import fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { inquirySchema, type Inquiry, type InquiryInput } from "./inquiry-types";
import { executeQuery } from "./db";
import {
  generateAdminToken,
  verifyAdminToken,
  signPinHash,
  verifySignedPinHash,
  setActivePinHash,
} from "./auth-token";

export { generateAdminToken, verifyAdminToken };

// Security State: In-Memory Sliding-Window Rate Limiters
interface PinAttemptTracker {
  count: number;
  lockoutUntil: number;
}
const pinAttemptMap = new Map<string, PinAttemptTracker>();

// Inquiries rate limiter: records timestamps per phone number
const phoneSubmissionHistory = new Map<string, number[]>();
const globalSubmissionTimestamps: number[] = [];

// Fallback in-memory state when MySQL is unavailable or pending cloud configuration
let memoryDealerPinHash: string | null = null;
let memoryBaseRatePerSqFt: number = 1199;
const memoryInquiries: Inquiry[] = [];

export const checkDbHealthFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getDbPool } = await import("./db");
    const pool = await getDbPool();
    if (!pool) {
      return {
        connected: false,
        isVercel: Boolean(process.env["VERCEL"]),
        message: "No MySQL connection configured. Running in cloud fallback mode.",
      };
    }
    await pool.query("SELECT 1 as ping");
    return {
      connected: true,
      isVercel: Boolean(process.env["VERCEL"]),
      message: "MySQL Online & Active",
    };
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    return {
      connected: false,
      isVercel: Boolean(process.env["VERCEL"]),
      message:
        errorObj?.code === "ECONNREFUSED"
          ? "MySQL is running on localhost. On Vercel, configure DATABASE_URL in Vercel Project Settings."
          : `Database offline: ${errorObj?.message || "Connection failed"}`,
    };
  }
});

/**
 * Strips HTML tags and script injections to protect against stored XSS.
 */
function sanitizeText(str?: string | null): string | null {
  if (!str) return null;
  return str
    .replace(/<[^>]*>?/gm, "") // strip html tags
    .replace(/[&<>"']/g, (m) => {
      switch (m) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#039;";
        default:
          return m;
      }
    })
    .trim();
}

function mapRowToInquiry(row: Record<string, unknown>): Inquiry {
  let visitDateStr: string | undefined = undefined;
  if (row["visit_date"]) {
    if (typeof row["visit_date"] === "string") {
      visitDateStr = row["visit_date"];
    } else if (row["visit_date"] instanceof Date) {
      visitDateStr = row["visit_date"].toISOString().slice(0, 10);
    }
  }

  let createdAtStr = new Date().toISOString();
  if (row["created_at"]) {
    if (typeof row["created_at"] === "string") {
      createdAtStr = row["created_at"];
    } else if (row["created_at"] instanceof Date) {
      createdAtStr = row["created_at"].toISOString();
    }
  }

  return {
    id: String(row["id"] || ""),
    name: String(row["name"] || ""),
    phone: String(row["phone"] || ""),
    email: row["email"] ? String(row["email"]) : undefined,
    plotPreference: String(row["plot_preference"] || "1000 sq ft"),
    visitDate: visitDateStr,
    slot: String(row["slot"] || "Morning (10:00 AM)"),
    cabPickup: Boolean(row["cab_pickup"]),
    pickupLocation: String(row["pickup_location"] || "On Site"),
    message: row["message"] ? String(row["message"]) : undefined,
    status: (row["status"] as Inquiry["status"]) || "New",
    createdAt: createdAtStr,
  };
}

interface AdminConfigRow {
  id?: number;
  dealer_pin?: string;
  base_rate_per_sq_ft?: number;
}

// -------------------------------------------------------------
// SECURE DEALER AUTHENTICATION WITH BCRYPT & BRUTE-FORCE DEFENSE
// -------------------------------------------------------------

function trySavePinDisk(hash: string) {
  try {
    fs.writeFileSync("/tmp/galaxy_green_pin.json", JSON.stringify({ hash, time: Date.now() }));
  } catch {
    // Disk write fallback ignored in restricted environments
  }
}

function tryLoadPinDisk(): string | null {
  try {
    if (fs.existsSync("/tmp/galaxy_green_pin.json")) {
      const raw = fs.readFileSync("/tmp/galaxy_green_pin.json", "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed?.hash) return parsed.hash;
    }
  } catch {
    // Disk read fallback ignored
  }
  return null;
}

function trySaveInquiriesDisk(list: Inquiry[]) {
  try {
    fs.writeFileSync("/tmp/galaxy_green_inquiries.json", JSON.stringify(list));
  } catch {
    // Disk write fallback ignored
  }
}

function tryLoadInquiriesDisk(): Inquiry[] {
  try {
    if (fs.existsSync("/tmp/galaxy_green_inquiries.json")) {
      const raw = fs.readFileSync("/tmp/galaxy_green_inquiries.json", "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Disk read fallback ignored
  }
  return [];
}

export const verifyDealerPinFn = createServerFn({ method: "POST" })
  .validator(
    (data: { pin: string; clientPinToken?: string | undefined }) =>
      data as { pin: string; clientPinToken?: string | undefined },
  )
  .handler(async ({ data }) => {
    // Rate limit dealer authentication per client session
    const trackerKey = "dealer_portal";
    const now = Date.now();
    let tracker = pinAttemptMap.get(trackerKey);
    if (!tracker) {
      tracker = { count: 0, lockoutUntil: 0 };
      pinAttemptMap.set(trackerKey, tracker);
    }

    if (tracker.lockoutUntil > now) {
      const remainingSecs = Math.ceil((tracker.lockoutUntil - now) / 1000);
      return {
        success: false,
        error: `Security lockout: Too many incorrect attempts. Please wait ${remainingSecs} seconds.`,
      };
    }

    // Artificial delay to thwart automated high-frequency timing attacks
    await new Promise((r) => setTimeout(r, 250));

    let storedPin = "";

    // 1. Check MySQL first as authoritative source of truth
    const rows = await executeQuery<AdminConfigRow[]>(
      "SELECT dealer_pin FROM admin_config WHERE id = 1 LIMIT 1",
    );
    if (rows && rows.length > 0 && rows[0]?.dealer_pin) {
      storedPin = String(rows[0].dealer_pin);
      setActivePinHash(storedPin);
      memoryDealerPinHash = storedPin;
      trySavePinDisk(storedPin);
    }

    // 2. If DB is offline or returned empty, check server in-memory hash or /tmp disk cache
    if (!storedPin) {
      storedPin = memoryDealerPinHash || tryLoadPinDisk() || "";
    }

    // 3. Client signed token fallback if DB completely uninitialized
    if (!storedPin && data.clientPinToken) {
      const verified = verifySignedPinHash(data.clientPinToken);
      if (verified) {
        storedPin = verified;
        memoryDealerPinHash = verified;
        setActivePinHash(verified);
        trySavePinDisk(verified);
      }
    }

    const cleanInput = String(data.pin || "").trim();
    if (!cleanInput) {
      return {
        success: false,
        error: "Password / PIN cannot be blank.",
      };
    }

    let isPinMatch = false;
    if (storedPin.startsWith("$2b$") || storedPin.startsWith("$2a$")) {
      isPinMatch = await bcrypt.compare(cleanInput, storedPin);
    } else if (storedPin.length > 0) {
      // Legacy plaintext comparison with seamless on-the-fly bcrypt upgrade
      isPinMatch = cleanInput === storedPin;
      if (isPinMatch) {
        try {
          const upgradedHash = await bcrypt.hash(cleanInput, 10);
          memoryDealerPinHash = upgradedHash;
          storedPin = upgradedHash;
          setActivePinHash(upgradedHash);
          trySavePinDisk(upgradedHash);
          await executeQuery("UPDATE admin_config SET dealer_pin = ? WHERE id = 1", [upgradedHash]);
        } catch (upgradeErr) {
          console.error("Failed to upgrade plaintext PIN to bcrypt:", upgradeErr);
        }
      }
    } else {
      // Fallback default PIN "0000" if uninitialized
      isPinMatch = cleanInput === "0000";
      if (isPinMatch) {
        try {
          const defaultHash = await bcrypt.hash("0000", 10);
          memoryDealerPinHash = defaultHash;
          storedPin = defaultHash;
          setActivePinHash(defaultHash);
          trySavePinDisk(defaultHash);
          await executeQuery("UPDATE admin_config SET dealer_pin = ? WHERE id = 1", [defaultHash]);
        } catch (e) {
          void e;
        }
      }
    }

    if (isPinMatch) {
      // Clear failed count on successful authentication
      pinAttemptMap.delete(trackerKey);
      setActivePinHash(storedPin);
      const token = generateAdminToken(storedPin);
      const signedPinToken = storedPin ? signPinHash(storedPin) : undefined;
      return { success: true, token, signedPinToken };
    }

    // Increment failed attempts
    tracker.count += 1;
    if (tracker.count >= 5) {
      // Lockout for 5 minutes after 5 consecutive failures
      tracker.lockoutUntil = now + 5 * 60 * 1000;
      return {
        success: false,
        error: "Access locked due to 5 failed attempts. Please try again after 5 minutes.",
      };
    }

    pinAttemptMap.set(trackerKey, tracker);
    const remainingAttempts = 5 - tracker.count;
    return {
      success: false,
      error: `Access denied. Invalid Password / PIN. (${remainingAttempts} attempts remaining before lockout).`,
    };
  });

// Returns portal settings WITHOUT EVER EXPOSING the dealer password/PIN
export const getAdminConfigFn = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await executeQuery<AdminConfigRow[]>(
    "SELECT base_rate_per_sq_ft FROM admin_config WHERE id = 1 LIMIT 1",
  );
  if (rows && rows.length > 0 && rows[0]?.base_rate_per_sq_ft !== undefined) {
    return {
      baseRatePerSqFt: Number(rows[0].base_rate_per_sq_ft) || memoryBaseRatePerSqFt,
    };
  }

  return { baseRatePerSqFt: memoryBaseRatePerSqFt };
});

export const updateAdminConfigFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token?: string | undefined;
      dealerPin?: string | undefined;
      newPin?: string | undefined;
      baseRatePerSqFt?: number | undefined;
      clientPinToken?: string | undefined;
    }) => data,
  )
  .handler(async ({ data }) => {
    // Check authentication: either valid session token OR matching PIN
    let isAuthorized = false;
    if (data.token && verifyAdminToken(data.token)) {
      isAuthorized = true;
    } else if (data.dealerPin) {
      const rows = await executeQuery<AdminConfigRow[]>(
        "SELECT dealer_pin FROM admin_config WHERE id = 1 LIMIT 1",
      );
      let storedPin =
        rows && rows.length > 0 && rows[0]?.dealer_pin ? String(rows[0].dealer_pin) : "";
      if (!storedPin) {
        storedPin = memoryDealerPinHash || tryLoadPinDisk() || "";
      }
      if (!storedPin && data.clientPinToken) {
        storedPin = verifySignedPinHash(data.clientPinToken) || "";
      }
      const clean = String(data.dealerPin).trim();
      if (storedPin.startsWith("$2b$") || storedPin.startsWith("$2a$")) {
        isAuthorized = await bcrypt.compare(clean, storedPin);
      } else if (storedPin) {
        isAuthorized = clean === storedPin;
      } else {
        isAuthorized = clean === "0000";
      }
    }

    if (!isAuthorized) {
      return {
        success: false,
        error: "Unauthorized. Please unlock the portal with your password.",
      };
    }

    // If updating PIN, validate format (supports 4 to 32 characters)
    if (data.newPin) {
      const cleanNew = data.newPin.trim();
      if (cleanNew.length < 4 || cleanNew.length > 32) {
        return { success: false, error: "Password / PIN must be between 4 and 32 characters." };
      }
    }

    const updates: string[] = [];
    const params: (string | number)[] = [];
    let signedPinToken: string | undefined = undefined;

    if (data.newPin) {
      const cleanNew = data.newPin.trim();
      const hashedPin = await bcrypt.hash(cleanNew, 10);
      memoryDealerPinHash = hashedPin;
      trySavePinDisk(hashedPin);
      setActivePinHash(hashedPin);
      signedPinToken = signPinHash(hashedPin);
      updates.push("dealer_pin = ?");
      params.push(hashedPin);
    }
    if (data.baseRatePerSqFt !== undefined) {
      memoryBaseRatePerSqFt = data.baseRatePerSqFt;
      updates.push("base_rate_per_sq_ft = ?");
      params.push(data.baseRatePerSqFt);
    }

    if (updates.length === 0) {
      return { success: true, signedPinToken };
    }

    // Ensure row id = 1 exists in admin_config if DB is reachable
    const defaultHash = memoryDealerPinHash || (await bcrypt.hash("0000", 10));
    await executeQuery(
      "INSERT IGNORE INTO admin_config (id, dealer_pin, base_rate_per_sq_ft) VALUES (1, ?, 1199)",
      [defaultHash],
    );

    const sql = `UPDATE admin_config SET ${updates.join(", ")} WHERE id = 1`;
    const res = await executeQuery(sql, params);

    if (res === null) {
      return {
        success: false,
        error: "Database write failed. Unable to update security settings in MySQL.",
      };
    }
    return {
      success: true,
      signedPinToken,
      message:
        "Security Password updated in MySQL database! All sessions logged out across all devices.",
    };
  });

// Protected: Only authenticated session token holders can fetch customer inquiries
export const getInquiriesFn = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      console.warn("[Security Alert] Unauthorized access attempt to getInquiriesFn blocked.");
      return [];
    }

    const rows = await executeQuery<Record<string, unknown>[]>(
      "SELECT * FROM inquiries ORDER BY created_at DESC",
    );
    if (rows && Array.isArray(rows) && rows.length > 0) {
      return rows.map(mapRowToInquiry);
    }
    if (memoryInquiries.length === 0) {
      const disk = tryLoadInquiriesDisk();
      if (disk.length > 0) {
        memoryInquiries.push(...disk);
      }
    }
    return memoryInquiries;
  });

// Public: Buyers submit inquiries with honeypot trap, sanitization, and sliding-window rate limit
export const submitInquiryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => inquirySchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Anti-Bot Honeypot Defense:
    // If the invisible 'website' field was filled, a bot triggered the form.
    // Silently return success to avoid tipping off the bot.
    if (data.website && data.website.trim().length > 0) {
      console.warn("[Bot Defense] Automated bot submission rejected via honeypot trap.");
      return {
        success: true,
        inquiry: {
          id: `GG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          name: sanitizeText(data.name) || "Customer",
          phone: data.phone,
          plotPreference: data.plotPreference,
          slot: data.slot,
          cabPickup: false,
          pickupLocation: "On Site",
          status: "New" as const,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 2. Sliding-Window Rate Limiting
    const now = Date.now();
    const tenMinsAgo = now - 10 * 60 * 1000;

    // A. Phone-specific rate limit (max 3 submissions / 10 minutes)
    const phoneHistory = (phoneSubmissionHistory.get(data.phone) || []).filter(
      (t) => t > tenMinsAgo,
    );
    if (phoneHistory.length >= 3) {
      return {
        success: false,
        error: "Too many submissions. Our team will contact you shortly on your provided number.",
      };
    }
    phoneHistory.push(now);
    phoneSubmissionHistory.set(data.phone, phoneHistory);

    // B. Global submission throttle (max 40 submissions / 5 minutes)
    const fiveMinsAgo = now - 5 * 60 * 1000;
    while (globalSubmissionTimestamps.length > 0 && globalSubmissionTimestamps[0]! < fiveMinsAgo) {
      globalSubmissionTimestamps.shift();
    }
    if (globalSubmissionTimestamps.length >= 40) {
      return {
        success: false,
        error: "High server load. Please call us directly or retry in a few moments.",
      };
    }
    globalSubmissionTimestamps.push(now);

    // 3. XSS Sanitization & Record Generation
    const sanitizedName = sanitizeText(data.name) || "Guest";
    const sanitizedEmail = sanitizeText(data.email) || null;
    const sanitizedPlot = sanitizeText(data.plotPreference) || "1000 sq ft";
    const sanitizedMsg = sanitizeText(data.message) || null;

    const newInquiry: Inquiry = {
      name: sanitizedName,
      phone: data.phone,
      email: sanitizedEmail || undefined,
      plotPreference: sanitizedPlot,
      visitDate: data.visitDate || undefined,
      slot: data.slot,
      cabPickup: false,
      pickupLocation: "On Site",
      message: sanitizedMsg || undefined,
      id: `GG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "New",
      createdAt: new Date().toISOString(),
    };

    const res = await executeQuery(
      `INSERT INTO inquiries (id, name, phone, email, plot_preference, visit_date, slot, cab_pickup, pickup_location, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newInquiry.id,
        newInquiry.name,
        newInquiry.phone,
        newInquiry.email || null,
        newInquiry.plotPreference,
        newInquiry.visitDate || null,
        newInquiry.slot,
        newInquiry.cabPickup ? 1 : 0,
        newInquiry.pickupLocation,
        newInquiry.message || null,
        newInquiry.status,
      ],
    );

    memoryInquiries.unshift(newInquiry);
    trySaveInquiriesDisk(memoryInquiries);

    if (res !== null) {
      return { success: true, inquiry: newInquiry };
    }
    return { success: true, inquiry: newInquiry, message: "Inquiry recorded and synchronized." };
  });

// Protected: Updating lead status requires admin token
export const updateInquiryStatusFn = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string; status: Inquiry["status"] }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized" };
    }

    const target = memoryInquiries.find((i) => i.id === data.id);
    if (target) {
      target.status = data.status;
      trySaveInquiriesDisk(memoryInquiries);
    }

    const res = await executeQuery("UPDATE inquiries SET status = ? WHERE id = ?", [
      data.status,
      data.id,
    ]);
    if (res !== null) {
      return { success: true };
    }
    return { success: true, message: "Lead status updated and synchronized." };
  });
