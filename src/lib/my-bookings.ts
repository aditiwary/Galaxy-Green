/**
 * Client device local storage manager & server synchronizer for "My Bookings"
 * Persists scheduled visits privately on the user's device/browser cache
 * and keeps them synchronized in real time with the online MySQL server & Admin CRM.
 */
import { deleteUserBookingFn, updateUserBookingFn } from "./server-inquiries";

export interface LocalBooking {
  id: string;
  name: string;
  phone: string;
  plotPreference: string;
  visitDate?: string;
  slot?: string;
  message?: string;
  bookedAt: string;
}

const STORAGE_KEY = "gg_my_bookings_cache";
const EVENT_NAME = "gg_my_bookings_updated";
const ADMIN_LEADS_STORAGE_KEY = "galaxy_green_leads_v1";
const ADMIN_EVENT_NAME = "gg_leads_updated";

export function getLocalBookings(): LocalBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to read local bookings cache:", err);
    return [];
  }
}

export function saveLocalBooking(
  booking: Omit<LocalBooking, "bookedAt"> & { bookedAt?: string },
): LocalBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getLocalBookings();
    const newEntry: LocalBooking = {
      ...booking,
      bookedAt: booking.bookedAt || new Date().toISOString(),
    };

    // Filter out if identical ID exists, then prepend newest
    const updated = [newEntry, ...existing.filter((b) => b.id !== booking.id)].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    window.dispatchEvent(new CustomEvent(ADMIN_EVENT_NAME));
    return updated;
  } catch (err) {
    console.warn("Failed to persist local booking:", err);
    return getLocalBookings();
  }
}

export function updateLocalBooking(id: string, updates: Partial<LocalBooking>): LocalBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getLocalBookings();
    const updated = existing.map((b) => (b.id === id ? { ...b, ...updates } : b));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Also update in admin leads cache if present on this device
    try {
      const adminRaw = localStorage.getItem(ADMIN_LEADS_STORAGE_KEY);
      if (adminRaw) {
        const adminLeads = JSON.parse(adminRaw);
        if (Array.isArray(adminLeads)) {
          const updatedAdmin = adminLeads.map((item: { id: string; visitDate?: string; slot?: string; plotPreference?: string; message?: string }) => {
            if (item.id === id) {
              return {
                ...item,
                ...(updates.visitDate !== undefined ? { visitDate: updates.visitDate } : {}),
                ...(updates.slot !== undefined ? { slot: updates.slot } : {}),
                ...(updates.plotPreference !== undefined ? { plotPreference: updates.plotPreference } : {}),
                ...(updates.message !== undefined ? { message: updates.message } : {}),
              };
            }
            return item;
          });
          localStorage.setItem(ADMIN_LEADS_STORAGE_KEY, JSON.stringify(updatedAdmin));
        }
      }
    } catch {
      // ignore admin sync error
    }

    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    window.dispatchEvent(new CustomEvent(ADMIN_EVENT_NAME));
    return updated;
  } catch (err) {
    console.warn("Failed to update local booking:", err);
    return getLocalBookings();
  }
}

export function removeLocalBooking(id: string): LocalBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getLocalBookings();
    const updated = existing.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Also remove from admin leads cache if present on this device
    try {
      const adminRaw = localStorage.getItem(ADMIN_LEADS_STORAGE_KEY);
      if (adminRaw) {
        const adminLeads = JSON.parse(adminRaw);
        if (Array.isArray(adminLeads)) {
          const updatedAdmin = adminLeads.filter((item: { id: string }) => item.id !== id);
          localStorage.setItem(ADMIN_LEADS_STORAGE_KEY, JSON.stringify(updatedAdmin));
        }
      }
    } catch {
      // ignore admin sync error
    }

    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    window.dispatchEvent(new CustomEvent(ADMIN_EVENT_NAME));
    return updated;
  } catch (err) {
    console.warn("Failed to remove local booking:", err);
    return getLocalBookings();
  }
}

export function subscribeToBookings(callback: (bookings: LocalBooking[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => {
    callback(getLocalBookings());
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

/**
 * Server-synced delete: deletes booking from MySQL server, memory cache,
 * and local storage, ensuring admin panel immediately updates.
 */
export async function syncDeleteUserBooking(
  id: string,
  phone?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteUserBookingFn({ data: { id, phone } });
    removeLocalBooking(id);
    if (res && typeof res === "object" && "success" in res && !res.success && res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  } catch (err) {
    // If offline or network glitch, still remove locally to respect user intent
    removeLocalBooking(id);
    console.warn("Server booking deletion notice:", err);
    return {
      success: true,
      error: err instanceof Error ? err.message : "Deleted locally; will sync with server.",
    };
  }
}

/**
 * Server-synced update: updates booking on MySQL server, memory cache,
 * and local storage, ensuring admin panel immediately updates.
 */
export async function syncUpdateUserBooking(
  id: string,
  updates: {
    visitDate?: string;
    slot?: string;
    plotPreference?: string;
    message?: string;
    phone?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await updateUserBookingFn({ data: { id, ...updates } });
    if (res && typeof res === "object" && "success" in res && !res.success && res.error) {
      return { success: false, error: res.error };
    }
    updateLocalBooking(id, updates);
    return { success: true };
  } catch (err) {
    console.error("Server booking update error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to sync updates with server.",
    };
  }
}
