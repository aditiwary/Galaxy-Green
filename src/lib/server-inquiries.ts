import { createServerFn } from "@tanstack/react-start";
import { inquirySchema, type Inquiry } from "./inquiry-types";
import { isMySQLConfigured, executeQuery } from "./db";

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

async function getFsAndPath() {
  if (typeof window !== "undefined") return null;
  const fs = await import("node:fs");
  const path = await import("node:path");
  return { fs: fs.default, path: path.default };
}

async function readLeadsFromFile(): Promise<Inquiry[]> {
  try {
    const modules = await getFsAndPath();
    if (!modules) return [];
    const { fs, path } = modules;
    const leadsFile = path.resolve(process.cwd(), "data/leads.json");
    if (fs.existsSync(leadsFile)) {
      const content = fs.readFileSync(leadsFile, "utf-8");
      return JSON.parse(content) as Inquiry[];
    }
  } catch (err) {
    console.error("Error reading leads file:", err);
  }
  return [];
}

async function writeLeadsToFile(leads: Inquiry[]): Promise<void> {
  try {
    const modules = await getFsAndPath();
    if (!modules) return;
    const { fs, path } = modules;
    const leadsFile = path.resolve(process.cwd(), "data/leads.json");
    const dir = path.dirname(leadsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing leads file:", err);
  }
}

async function forwardToGoogleSheets(inquiry: Inquiry): Promise<void> {
  try {
    const modules = await getFsAndPath();
    let webhookUrl = process.env["GOOGLE_SHEETS_WEBHOOK_URL"];
    if (!webhookUrl && modules) {
      const { fs, path } = modules;
      const configFile = path.resolve(process.cwd(), "data/config.json");
      if (fs.existsSync(configFile)) {
        try {
          const conf = JSON.parse(fs.readFileSync(configFile, "utf-8"));
          webhookUrl = conf.googleSheetsWebhookUrl;
        } catch {
          // ignore
        }
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
  if (isMySQLConfigured()) {
    const rows = await executeQuery<any[]>("SELECT * FROM admin_config WHERE id = 1 LIMIT 1");
    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        googleSheetsWebhookUrl: r.google_sheets_webhook_url || "",
        dealerPin: r.dealer_pin || "9044",
        baseRatePerSqFt: Number(r.base_rate_per_sq_ft) || 1400,
      };
    }
  }

  try {
    const modules = await getFsAndPath();
    if (!modules) return { googleSheetsWebhookUrl: "", dealerPin: "9044", baseRatePerSqFt: 1400 };
    const { fs, path } = modules;
    const configFile = path.resolve(process.cwd(), "data/config.json");
    if (fs.existsSync(configFile)) {
      return JSON.parse(fs.readFileSync(configFile, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading config:", err);
  }
  return { googleSheetsWebhookUrl: "", dealerPin: "9044", baseRatePerSqFt: 1400 };
});

export const updateAdminConfigFn = createServerFn({ method: "POST" })
  .validator((data: { googleSheetsWebhookUrl?: string; dealerPin?: string; baseRatePerSqFt?: number }) => data)
  .handler(async ({ data }) => {
    if (isMySQLConfigured()) {
      await executeQuery(
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
    }

    try {
      const modules = await getFsAndPath();
      if (!modules) return { success: false };
      const { fs, path } = modules;
      const configFile = path.resolve(process.cwd(), "data/config.json");
      let current = { googleSheetsWebhookUrl: "", dealerPin: "9044", baseRatePerSqFt: 1400 };
      if (fs.existsSync(configFile)) {
        try {
          current = JSON.parse(fs.readFileSync(configFile, "utf-8"));
        } catch {
          // ignore
        }
      }
      const updated = { ...current, ...data };
      fs.writeFileSync(configFile, JSON.stringify(updated, null, 2), "utf-8");
      return { success: true, config: updated };
    } catch (err) {
      console.error("Error saving config:", err);
      return { success: false };
    }
  });

export const getInquiriesFn = createServerFn({ method: "GET" }).handler(async () => {
  if (isMySQLConfigured()) {
    const rows = await executeQuery<any[]>("SELECT * FROM inquiries ORDER BY created_at DESC");
    if (rows && Array.isArray(rows) && rows.length > 0) {
      return rows.map(mapRowToInquiry);
    }
  }
  return await readLeadsFromFile();
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

    if (isMySQLConfigured()) {
      await executeQuery(
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
    }

    const leads = await readLeadsFromFile();
    leads.unshift(newInquiry);
    await writeLeadsToFile(leads);
    await forwardToGoogleSheets(newInquiry);
    return { success: true, inquiry: newInquiry };
  });

export const updateInquiryStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: Inquiry["status"] }) => data)
  .handler(async ({ data }) => {
    if (isMySQLConfigured()) {
      await executeQuery("UPDATE inquiries SET status = ? WHERE id = ?", [data.status, data.id]);
    }

    const leads = await readLeadsFromFile();
    const lead = leads.find((l) => l.id === data.id);
    if (lead) {
      lead.status = data.status;
      await writeLeadsToFile(leads);
      return { success: true, inquiry: lead };
    }
    return { success: false, error: "Lead not found" };
  });
