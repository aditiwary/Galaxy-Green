import { createServerFn } from "@tanstack/react-start";
import { inquirySchema, type Inquiry } from "./inquiry-types";

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
  return await readLeadsFromFile();
});

export const submitInquiryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => inquirySchema.parse(data))
  .handler(async ({ data }) => {
    const leads = await readLeadsFromFile();
    const newInquiry: Inquiry = {
      ...data,
      id: `GG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "New",
      createdAt: new Date().toISOString(),
    };
    leads.unshift(newInquiry);
    await writeLeadsToFile(leads);
    await forwardToGoogleSheets(newInquiry);
    return { success: true, inquiry: newInquiry };
  });

export const updateInquiryStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: Inquiry["status"] }) => data)
  .handler(async ({ data }) => {
    const leads = await readLeadsFromFile();
    const lead = leads.find((l) => l.id === data.id);
    if (lead) {
      lead.status = data.status;
      await writeLeadsToFile(leads);
      return { success: true, inquiry: lead };
    }
    return { success: false, error: "Lead not found" };
  });
