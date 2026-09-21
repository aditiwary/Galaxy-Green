import { createServerFn } from "@tanstack/react-start";
import { inquirySchema, type Inquiry } from "./inquiry-types";
import { executeQuery } from "./db";
import crypto from "node:crypto";

const SECRET = process.env["ADMIN_SESSION_SECRET"] || "gg_dealer_session_secret_2026_secured";

export function generateAdminToken(): string {
  const timestamp = Date.now();
  const hash = crypto.createHmac("sha256", SECRET).update(`admin_${timestamp}`).digest("hex");
  return `${timestamp}_${hash}`;
}

export function verifyAdminToken(token?: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split("_");
  if (parts.length !== 2) return false;
  const [timeStr, expectedHash] = parts;
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
    pickupLocation: row.pickup_location || "Self Drive",
    message: row.message || undefined,
    status: row.status || "New",
    createdAt: createdAtStr,
  };
}

async function forwardToGoogleSheets(inquiry: Inquiry): Promise<void> {
  try {
    let webhookUrl = process.env["GOOGLE_SHEETS_WEBHOOK_URL"];
    if (!webhookUrl) {
      const rows = await executeQuery<any[]>("SELECT google_sheets_webhook_url FROM admin_config WHERE id = 1 LIMIT 1");
      if (rows && rows.length > 0) {
        webhookUrl = rows[0].google_sheets_webhook_url;
      }
    }

    if (webhookUrl && typeof webhookUrl === "string" && webhookUrl.startsWith("http")) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiry),
      });
    }
  } catch (err) {
    console.error("Google Sheets forward error:", err);
  }
}

// -------------------------------------------------------------
// SECURE DEALER AUTHENTICATION
// -------------------------------------------------------------

export const verifyDealerPinFn = createServerFn({ method: "POST" })
  .validator((data: { pin: string }) => data)
  .handler(async ({ data }) => {
    // Artificial delay to thwart automated brute-force attacks
    await new Promise((r) => setTimeout(r, 250));

    const rows = await executeQuery<any[]>("SELECT dealer_pin FROM admin_config WHERE id = 1 LIMIT 1");
    const currentPin = rows && rows.length > 0 ? String(rows[0].dealer_pin) : "0000";

    const cleanInput = String(data.pin || "").trim();
    if (cleanInput === currentPin) {
      const token = generateAdminToken();
      return { success: true, token };
    }

    return { success: false, error: "Access denied. Invalid credentials." };
  });

// Returns portal settings WITHOUT EVER EXPOSING the dealer password/PIN
export const getAdminConfigFn = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await executeQuery<any[]>("SELECT google_sheets_webhook_url, base_rate_per_sq_ft FROM admin_config WHERE id = 1 LIMIT 1");
  if (rows && rows.length > 0) {
    const r = rows[0];
    return {
      googleSheetsWebhookUrl: r.google_sheets_webhook_url || "",
      baseRatePerSqFt: Number(r.base_rate_per_sq_ft) || 1400,
    };
  }

  return { googleSheetsWebhookUrl: "", baseRatePerSqFt: 1400 };
});

export const updateAdminConfigFn = createServerFn({ method: "POST" })
  .validator((data: { token: string; googleSheetsWebhookUrl?: string; newPin?: string; baseRatePerSqFt?: number }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized. Please unlock the portal with your PIN." };
    }

    // If updating PIN, validate format
    if (data.newPin && !/^\d{4,8}$/.test(data.newPin)) {
      return { success: false, error: "PIN must be between 4 to 8 digits." };
    }

    const res = await executeQuery(
      `INSERT INTO admin_config (id, google_sheets_webhook_url, dealer_pin, base_rate_per_sq_ft)
       VALUES (1, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         google_sheets_webhook_url = COALESCE(?, google_sheets_webhook_url),
         dealer_pin = COALESCE(?, dealer_pin),
         base_rate_per_sq_ft = COALESCE(?, base_rate_per_sq_ft)`,
      [
        data.googleSheetsWebhookUrl || "",
        data.newPin || "0000",
        data.baseRatePerSqFt || 1400,
        data.googleSheetsWebhookUrl,
        data.newPin,
        data.baseRatePerSqFt,
      ]
    );

    if (res !== null) {
      return { success: true };
    }
    return { success: false, error: "Failed to update configuration in MySQL." };
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
    if (rows && Array.isArray(rows)) {
      return rows.map(mapRowToInquiry);
    }
    return [];
  });

// Public: Buyers submit inquiries
export const submitInquiryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => inquirySchema.parse(data))
  .handler(async ({ data }) => {
    const newInquiry: Inquiry = {
      ...data,
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

    await forwardToGoogleSheets(newInquiry);

    if (res !== null) {
      return { success: true, inquiry: newInquiry };
    }
    return { success: false, error: "Failed to record inquiry in MySQL" };
  });

// Protected: Updating lead status requires admin token
export const updateInquiryStatusFn = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string; status: Inquiry["status"] }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized" };
    }

    const res = await executeQuery("UPDATE inquiries SET status = ? WHERE id = ?", [data.status, data.id]);
    if (res !== null) {
      return { success: true };
    }
    return { success: false, error: "Failed to update inquiry status in MySQL" };
  });
