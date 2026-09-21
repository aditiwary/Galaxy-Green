import type { Inquiry, InquiryInput } from "./inquiry-types";
import { getInquiriesFn, submitInquiryFn, updateInquiryStatusFn } from "./server-inquiries";

const STORAGE_KEY = "galaxy_green_leads_v1";

const DEFAULT_FALLBACK_LEADS: Inquiry[] = [
  {
    id: "GG-2026-1042",
    name: "Rajeshwar Mehrotra",
    phone: "9839012450",
    email: "r.mehrotra@lucknowtextiles.in",
    plotPreference: "2000 sq ft (Corner East Facing)",
    visitDate: "2026-09-24",
    slot: "Morning (10:00 AM)",
    cabPickup: true,
    pickupLocation: "Amausi Airport (CCSIA)",
    message: "Looking for immediate registration. Want corner plot facing green belt.",
    status: "Visit Scheduled",
    createdAt: "2026-09-21T09:30:00.000Z",
  },
  {
    id: "GG-2026-1041",
    name: "Dr. Ananya Srivastava",
    phone: "9415087321",
    email: "dr.ananya@apollomedics.org",
    plotPreference: "1500 sq ft",
    visitDate: "2026-09-22",
    slot: "Evening Sunset (4:30 PM)",
    cabPickup: false,
    pickupLocation: "Self Drive",
    message: "Interested in building a 2-storey doctor residence. Verify SBI bank loan approval.",
    status: "Contacted",
    createdAt: "2026-09-20T17:15:00.000Z",
  },
  {
    id: "GG-2026-1039",
    name: "Col. Pradeep Verma (Retd.)",
    phone: "9198765432",
    email: "pradeep.verma1968@gmail.com",
    plotPreference: "1000 sq ft",
    visitDate: "2026-09-25",
    slot: "Morning (10:00 AM)",
    cabPickup: true,
    pickupLocation: "Amausi Metro Station",
    message: "Retirement home plot. Preferred near gated entrance security.",
    status: "New",
    createdAt: "2026-09-20T11:00:00.000Z",
  },
];

export async function fetchAllLeads(): Promise<Inquiry[]> {
  try {
    const serverLeads = await getInquiriesFn();
    if (Array.isArray(serverLeads)) {
      return serverLeads;
    }
  } catch (err) {
    console.warn("Using local storage fallback for leads:", err);
  }

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as Inquiry[];
      } catch {
        // ignore
      }
    }
  }

  return DEFAULT_FALLBACK_LEADS;
}

export async function recordNewInquiry(input: InquiryInput): Promise<Inquiry> {
  try {
    const res = await submitInquiryFn({ data: input });
    if (res?.inquiry) {
      return res.inquiry;
    }
  } catch (err) {
    console.warn("Server submission fallback:", err);
  }

  const fallbackLead: Inquiry = {
    ...input,
    id: `GG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "New",
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const current = await fetchAllLeads();
      const updated = [fallbackLead, ...current.filter((l) => l.id !== fallbackLead.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return fallbackLead;
}

export async function updateLeadStatus(
  id: string,
  status: Inquiry["status"]
): Promise<boolean> {
  try {
    const res = await updateInquiryStatusFn({ data: { id, status } });
    if (res?.success) return true;
  } catch (err) {
    console.warn("Server status update fallback:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const leads = await fetchAllLeads();
      const updated = leads.map((lead) =>
        lead.id === id ? { ...lead, status } : lead
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return true;
}

export function exportLeadsToCsv(leads: Inquiry[]): void {
  const headers = ["ID", "Name", "Phone", "Email", "Plot Preference", "Visit Date", "Slot", "Cab Pickup", "Pickup Location", "Status", "Created At", "Message"];
  const rows = leads.map((lead) => [
    lead.id,
    `"${lead.name.replace(/"/g, '""')}"`,
    `"${lead.phone}"`,
    `"${lead.email || ""}"`,
    `"${lead.plotPreference}"`,
    `"${lead.visitDate || ""}"`,
    `"${lead.slot}"`,
    lead.cabPickup ? "Yes" : "No",
    `"${lead.pickupLocation}"`,
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
