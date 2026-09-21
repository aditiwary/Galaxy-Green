import type { Inquiry, InquiryInput } from "./inquiry-types";
import {
  getInquiriesFn,
  submitInquiryFn,
  updateInquiryStatusFn,
  verifyDealerPinFn,
} from "./server-inquiries";

export { verifyDealerPinFn };

const STORAGE_KEY = "galaxy_green_leads_v1";

export async function fetchAllLeads(token?: string): Promise<Inquiry[]> {
  if (!token) return [];

  try {
    const serverLeads = await getInquiriesFn({ data: { token } });
    if (Array.isArray(serverLeads)) {
      return serverLeads;
    }
  } catch (err) {
    console.warn("Error fetching leads from server:", err);
  }

  return [];
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

  return {
    ...input,
    id: `GG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "New",
    createdAt: new Date().toISOString(),
  };
}

export async function updateLeadStatus(
  id: string,
  status: Inquiry["status"],
  token?: string
): Promise<boolean> {
  if (!token) return false;

  try {
    const res = await updateInquiryStatusFn({ data: { token, id, status } });
    if (res?.success) return true;
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
    "Cab Pickup",
    "Pickup Location",
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
