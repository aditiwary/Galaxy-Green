import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { inquirySchema, type Inquiry, type InquiryInput } from "./inquiry-types";
import { executeQuery } from "./db";
import { generateAdminToken, verifyAdminToken } from "./auth-token";

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
  } catch (err: any) {
    return {
      connected: false,
      isVercel: Boolean(process.env["VERCEL"]),
      message:
        err?.code === "ECONNREFUSED"
          ? "MySQL is running on localhost. On Vercel, configure DATABASE_URL in Vercel Project Settings."
          : `Database offline: ${err?.message || "Connection failed"}`,
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
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

function mapRowToInquiry(row: any): Inquiry {
  let visitDateStr: string | undefined = undefined;
  if (row.visit_date) {
    if (typeof row.visit_date === "string") {
      visitDateStr = row.visit_date.slice(0, 10);
    } else if (row.visit_date instanceof Date) {
      visitDateStr = row.visit_date.toISOString().slice(0, 10);
    }
  }

  let createdAtStr = new Date().toISOString();
  if (row.created_at) {
    if (typeof row.created_at === "string") {
      createdAtStr = row.created_at;
    } else if (row.created_at instanceof Date) {
      createdAtStr = row.created_at.toISOString();
    }
  }

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || undefined,
    plotPreference: row.plot_preference || "1000 sq ft",
    visitDate: visitDateStr,
    slot: row.slot || "Morning (10:00 AM)",
    cabPickup: Boolean(row.cab_pickup),
    pickupLocation: row.pickup_location || "On Site",
    message: row.message || undefined,
    status: row.status || "New",
    createdAt: createdAtStr,
  };
}

// -------------------------------------------------------------
// SECURE DEALER AUTHENTICATION WITH BCRYPT & BRUTE-FORCE DEFENSE
// -------------------------------------------------------------

export const verifyDealerPinFn = createServerFn({ method: "POST" })
  .validator((data: { pin: string }) => data)
  .handler(async ({ data }) => {
    const trackerKey = "dealer_portal_login";
    const now = Date.now();
    const tracker = pinAttemptMap.get(trackerKey) || { count: 0, lockoutUntil: 0 };

    // Check if lockout is active
    if (tracker.lockoutUntil > now) {
      const remainingSecs = Math.ceil((tracker.lockoutUntil - now) / 1000);
      return {
        success: false,
        error: `Security lockout: Too many incorrect attempts. Please wait ${remainingSecs} seconds.`,
      };
    }

    // Artificial delay to thwart automated high-frequency timing attacks
    await new Promise((r) => setTimeout(r, 250));

    const rows = await executeQuery<any[]>("SELECT dealer_pin FROM admin_config WHERE id = 1 LIMIT 1");
    const storedPin = rows && rows.length > 0 ? String(rows[0].dealer_pin) : memoryDealerPinHash || "";

    const cleanInput = String(data.pin || "").trim();

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
          await executeQuery("UPDATE admin_config SET dealer_pin = ? WHERE id = 1", [defaultHash]);
        } catch {}
      }
    }

    if (isPinMatch) {
      // Clear failed count on successful authentication
      pinAttemptMap.delete(trackerKey);
      const token = generateAdminToken();
      return { success: true, token };
    }

    // Increment failed attempts
    tracker.count += 1;
    if (tracker.count >= 5) {
      // Lock out for 15 minutes
      tracker.lockoutUntil = now + 15 * 60 * 1000;
      pinAttemptMap.set(trackerKey, tracker);
      return {
        success: false,
        error: "Security lockout: 5 failed attempts exceeded. Portal locked for 15 minutes.",
      };
    }

    pinAttemptMap.set(trackerKey, tracker);
    const remainingAttempts = 5 - tracker.count;
    return {
      success: false,
      error: `Access denied. Invalid PIN. (${remainingAttempts} attempts remaining before lockout).`,
    };
  });

// Returns portal settings WITHOUT EVER EXPOSING the dealer password/PIN
export const getAdminConfigFn = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await executeQuery<any[]>("SELECT base_rate_per_sq_ft FROM admin_config WHERE id = 1 LIMIT 1");
  if (rows && rows.length > 0) {
    const r = rows[0];
    return {
      baseRatePerSqFt: Number(r.base_rate_per_sq_ft) || memoryBaseRatePerSqFt,
    };
  }

  return { baseRatePerSqFt: memoryBaseRatePerSqFt };
});

export const updateAdminConfigFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token?: string;
      dealerPin?: string;
      newPin?: string;
      baseRatePerSqFt?: number;
    }) => data
  )
  .handler(async ({ data }) => {
    // Check authentication: either valid session token OR matching PIN
    let isAuthorized = false;
    if (data.token && verifyAdminToken(data.token)) {
      isAuthorized = true;
    } else if (data.dealerPin) {
      // Fallback check against DB PIN
      const rows = await executeQuery<any[]>("SELECT dealer_pin FROM admin_config WHERE id = 1 LIMIT 1");
      const storedPin = rows && rows.length > 0 ? String(rows[0].dealer_pin) : memoryDealerPinHash || "";
      const clean = String(data.dealerPin).trim();
      if (storedPin.startsWith("$2b$") || storedPin.startsWith("$2a$")) {
        isAuthorized = await bcrypt.compare(clean, storedPin);
      } else {
        isAuthorized = clean === storedPin;
      }
    }

    if (!isAuthorized) {
      return { success: false, error: "Unauthorized. Please unlock the portal with your PIN." };
    }

    // If updating PIN, validate format
    if (data.newPin && !/^\d{4,8}$/.test(data.newPin)) {
      return { success: false, error: "PIN must be between 4 to 8 digits." };
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.newPin) {
      const hashedPin = await bcrypt.hash(data.newPin, 10);
      memoryDealerPinHash = hashedPin;
      updates.push("dealer_pin = ?");
      params.push(hashedPin);
    }
    if (data.baseRatePerSqFt !== undefined) {
      memoryBaseRatePerSqFt = data.baseRatePerSqFt;
      updates.push("base_rate_per_sq_ft = ?");
      params.push(data.baseRatePerSqFt);
    }

    if (updates.length === 0) {
      return { success: true };
    }

    // Ensure row id = 1 exists in admin_config if DB is reachable
    const defaultHash = memoryDealerPinHash || (await bcrypt.hash("0000", 10));
    await executeQuery(
      "INSERT IGNORE INTO admin_config (id, dealer_pin, base_rate_per_sq_ft) VALUES (1, ?, 1199)",
      [defaultHash]
    );

    const sql = `UPDATE admin_config SET ${updates.join(", ")} WHERE id = 1`;
    const res = await executeQuery(sql, params);

    if (res !== null) {
      return { success: true, message: "Settings saved successfully in MySQL!" };
    }
    return {
      success: true,
      warning:
        "PIN updated in session memory. To permanently persist across Vercel restarts, configure DATABASE_URL in Vercel settings.",
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

    const rows = await executeQuery<any[]>("SELECT * FROM inquiries ORDER BY created_at DESC");
    if (rows && Array.isArray(rows) && rows.length > 0) {
      return rows.map(mapRowToInquiry);
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
    const phoneHistory = (phoneSubmissionHistory.get(data.phone) || []).filter((t) => t > tenMinsAgo);
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
      ]
    );

    memoryInquiries.unshift(newInquiry);

    if (res !== null) {
      return { success: true, inquiry: newInquiry };
    }
    return { success: true, inquiry: newInquiry, warning: "Inquiry saved in session cache (MySQL offline)." };
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
    }

    const res = await executeQuery("UPDATE inquiries SET status = ? WHERE id = ?", [data.status, data.id]);
    if (res !== null) {
      return { success: true };
    }
    return { success: true, warning: "Lead status updated in session cache (MySQL offline)." };
  });
