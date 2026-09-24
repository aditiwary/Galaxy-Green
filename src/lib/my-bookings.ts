/**
 * Client device local storage manager for "My Bookings"
 * Persists scheduled visits and inquiries privately on the user's current device / browser cache
 * without needing external user login.
 */

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
    return updated;
  } catch (err) {
    console.warn("Failed to persist local booking:", err);
    return getLocalBookings();
  }
}

export function removeLocalBooking(id: string): LocalBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getLocalBookings();
    const updated = existing.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
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
