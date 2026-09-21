import { createServerFn } from "@tanstack/react-start";
import { inquirySchema, type Inquiry } from "./inquiry-types";
import { executeQuery } from "./db";

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

export const getAdminConfigFn = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await executeQuery<any[]>("SELECT * FROM admin_config WHERE id = 1 LIMIT 1");
  if (rows && rows.length > 0) {
    const r = rows[0];
    return {
      googleSheetsWebhookUrl: r.google_sheets_webhook_url || "",
      dealerPin: r.dealer_pin || "9044",
      baseRatePerSqFt: Number(r.base_rate_per_sq_ft) || 1400,
    };
  }

  return { googleSheetsWebhookUrl: "", dealerPin: "9044", baseRatePerSqFt: 1400 };
});

export const updateAdminConfigFn = createServerFn({ method: "POST" })
  .validator((data: { googleSheetsWebhookUrl?: string; dealerPin?: string; baseRatePerSqFt?: number }) => data)
  .handler(async ({ data }) => {
    const res = await executeQuery(
      `INSERT INTO admin_config (id, google_sheets_webhook_url, dealer_pin, base_rate_per_sq_ft)
       VALUES (1, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         google_sheets_webhook_url = COALESCE(?, google_sheets_webhook_url),
         dealer_pin = COALESCE(?, dealer_pin),
         base_rate_per_sq_ft = COALESCE(?, base_rate_per_sq_ft)`,
      [
        data.googleSheetsWebhookUrl || "",
        data.dealerPin || "9044",
        data.baseRatePerSqFt || 1400,
        data.googleSheetsWebhookUrl,
        data.dealerPin,
        data.baseRatePerSqFt,
      ]
    );

    if (res !== null) {
      return { success: true, config: data };
    }
    return { success: false, error: "Failed to update admin config in MySQL" };
  });

export const getInquiriesFn = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await executeQuery<any[]>("SELECT * FROM inquiries ORDER BY created_at DESC");
  if (rows && Array.isArray(rows)) {
    return rows.map(mapRowToInquiry);
  }
  return [];
});

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

export const updateInquiryStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: Inquiry["status"] }) => data)
  .handler(async ({ data }) => {
    const res = await executeQuery("UPDATE inquiries SET status = ? WHERE id = ?", [data.status, data.id]);
    if (res !== null) {
      return { success: true };
    }
    return { success: false, error: "Failed to update inquiry status in MySQL" };
  });
