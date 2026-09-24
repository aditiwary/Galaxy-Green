import type { Inquiry, InquiryInput } from "./inquiry-types";
import {
  getInquiriesFn,
  submitInquiryFn,
  updateInquiryStatusFn,
  deleteInquiryFn,
  adminCreateInquiryFn,
  getAdminConfigFn,
  updateAdminConfigFn,
  verifyDealerPinFn,
  checkDbHealthFn,
} from "./server-inquiries";

export { verifyDealerPinFn, checkDbHealthFn };

const STORAGE_KEY = "galaxy_green_leads_v1";
const PIN_TOKEN_KEY = "gg_dealer_pin_signed_token";
const BASE_RATE_CACHE_KEY = "gg_market_base_rate";

export function getClientPinToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(PIN_TOKEN_KEY) || undefined;
}

export function setClientPinToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PIN_TOKEN_KEY, token);
}

export async function verifyDealerPin(
  pin: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  const clientPinToken = getClientPinToken();
  const res = await verifyDealerPinFn({ data: { pin, clientPinToken } });
  const typedRes = res as { success?: boolean; signedPinToken?: string } | undefined;
  if (typedRes?.success && typedRes?.signedPinToken) {
    setClientPinToken(typedRes.signedPinToken);
  }
  return res;
}

export async function fetchAllLeads(token?: string): Promise<Inquiry[]> {
  if (!token) return [];

  let serverLeads: Inquiry[] = [];
  try {
    const res = await getInquiriesFn({ data: { token } });
    if (Array.isArray(res)) {
      serverLeads = res;
    }
  } catch (err) {
    console.warn("Error fetching leads from server:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const localList: Inquiry[] = JSON.parse(saved);
        const map = new Map<string, Inquiry>();
        for (const item of serverLeads) {
          map.set(item.id, item);
        }
        for (const item of localList) {
          if (!map.has(item.id)) {
            map.set(item.id, item);
          }
        }
        return Array.from(map.values());
      }
    } catch {
      // ignore
    }
  }

  return serverLeads;
}

export async function recordNewInquiry(input: InquiryInput): Promise<Inquiry> {
  let created: Inquiry | null = null;
  try {
    const res = await submitInquiryFn({ data: input });
    if (res && typeof res === "object" && "success" in res && !res.success && res.error) {
      throw new Error(res.error);
    }
    if (res?.inquiry) {
      created = res.inquiry;
    }
  } catch (err) {
    if (
      err instanceof Error &&
      !err.message.includes("fetch") &&
      !err.message.includes("Failed to execute")
    ) {
      throw err;
    }
    console.warn("Server submission fallback:", err);
  }

  if (!created) {
    created = {
      ...input,
      id: `GG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "New",
      createdAt: new Date().toISOString(),
    };
  }

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const list: Inquiry[] = saved ? JSON.parse(saved) : [];
      list.unshift(created);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  return created;
}

export async function updateLeadStatus(
  id: string,
  status: Inquiry["status"],
  token?: string,
): Promise<boolean> {
  const activeToken =
    token ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("gg_dealer_token") || localStorage.getItem("gg_dealer_token")
      : undefined);
  if (!activeToken) return false;

  try {
    const res = await updateInquiryStatusFn({ data: { token: activeToken, id, status } });
    if (res?.success) {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const list: Inquiry[] = JSON.parse(saved);
            const updated = list.map((item) => (item.id === id ? { ...item, status } : item));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          }
        } catch (err) {
          void err;
        }
      }
      return true;
    }
  } catch (err) {
    console.warn("Server status update error:", err);
  }

  return false;
}

export function exportLeadsToCsv(leads: Inquiry[]): void {
  const headers = [
    "ID",
    "Name",
    "Phone",
    "Email",
    "Plot Preference",
    "Visit Date",
    "Slot",
    "Status",
    "Created At",
    "Message",
  ];
  const rows = leads.map((lead) => [
    lead.id,
    `"${lead.name.replace(/"/g, '""')}"`,
    `"${lead.phone}"`,
    `"${lead.email || ""}"`,
    `"${lead.plotPreference}"`,
    `"${lead.visitDate || ""}"`,
    `"${lead.slot}"`,
    `"${lead.status}"`,
    `"${new Date(lead.createdAt).toLocaleString("en-IN")}"`,
    `"${(lead.message || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Galaxy_Green_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function deleteLead(id: string, token?: string): Promise<boolean> {
  const activeToken =
    token ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("gg_dealer_token") || localStorage.getItem("gg_dealer_token")
      : undefined);
  if (!activeToken) return false;

  try {
    const res = await deleteInquiryFn({ data: { token: activeToken, id } });
    if (res?.success) {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const list: Inquiry[] = JSON.parse(saved);
            const filtered = list.filter((item) => item.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
          }
        } catch (err) {
          void err;
        }
      }
      return true;
    }
  } catch (err) {
    console.warn("Delete inquiry error:", err);
  }

  return false;
}

export async function adminAddLead(
  input: {
    name: string;
    phone: string;
    email?: string;
    plotPreference?: string;
    visitDate?: string;
    slot?: string;
    status?: Inquiry["status"];
    message?: string;
  },
  token?: string,
): Promise<Inquiry | null> {
  const activeToken =
    token ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("gg_dealer_token") || localStorage.getItem("gg_dealer_token")
      : undefined);
  if (!activeToken) return null;

  try {
    const res = await adminCreateInquiryFn({ data: { token: activeToken, inquiry: input } });
    if (res?.success && res.inquiry) {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          const list: Inquiry[] = saved ? JSON.parse(saved) : [];
          list.unshift(res.inquiry);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (err) {
          void err;
        }
      }
      return res.inquiry;
    }
  } catch (err) {
    console.warn("Admin add inquiry error:", err);
  }

  return null;
}

export async function fetchMarketBaseRate(): Promise<number> {
  try {
    const res = await getAdminConfigFn();
    if (res?.baseRatePerSqFt && !isNaN(res.baseRatePerSqFt)) {
      if (typeof window !== "undefined") {
        localStorage.setItem(BASE_RATE_CACHE_KEY, String(res.baseRatePerSqFt));
      }
      return res.baseRatePerSqFt;
    }
  } catch (err) {
    console.warn("Error fetching base rate from server:", err);
  }

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(BASE_RATE_CACHE_KEY);
    if (cached) {
      const parsed = parseInt(cached, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  return 1199;
}

export async function updateMarketBaseRate(
  rate: number,
  updatePlots = false,
  token?: string,
): Promise<{ success: boolean; rate?: number; message?: string }> {
  const activeToken =
    token ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("gg_dealer_token") || localStorage.getItem("gg_dealer_token")
      : undefined);

  try {
    const res = await updateAdminConfigFn({
      data: {
        token: activeToken,
        baseRatePerSqFt: rate,
        updatePlots,
      },
    });

    if (res?.success) {
      const newRate = res.baseRatePerSqFt || rate;
      if (typeof window !== "undefined") {
        localStorage.setItem(BASE_RATE_CACHE_KEY, String(newRate));
        window.dispatchEvent(
          new CustomEvent("market-rate-updated", { detail: { baseRate: newRate } }),
        );
      }
      return { success: true, rate: newRate, message: res.message };
    }
    return { success: false, message: res?.error || "Failed to update market price." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error saving market price.";
    return { success: false, message: msg };
  }
}

