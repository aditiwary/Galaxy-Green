/**
 * Visit scheduling date & time validation utilities
 * Ensures local timezone accuracy (immune to UTC date shift) and strict prevention of past date/time bookings.
 */

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseTimeHoursMinutes(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3]?.toUpperCase();
  if (meridian === "PM" && hours < 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

export function isTimePassedForDate(
  timeStr: string,
  selectedDate: string,
  now: Date = new Date(),
): boolean {
  const todayStr = getLocalDateString(now);

  // If date is in the past
  if (selectedDate < todayStr) return true;
  // If date is in the future
  if (selectedDate > todayStr) return false;

  // Selected date is TODAY: check against current time
  const parsed = parseTimeHoursMinutes(timeStr);
  if (!parsed) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotMinutes = parsed.hours * 60 + parsed.minutes;

  return currentMinutes >= slotMinutes;
}

export interface PresetSlot {
  id: string;
  label: string;
}

export const PRESET_SLOTS: readonly PresetSlot[] = [
  { id: "Morning (10:00 AM)", label: "10:00 AM (Morning)" },
  { id: "Afternoon (2:00 PM)", label: "02:00 PM (Afternoon)" },
  { id: "Evening Sunset (4:30 PM)", label: "04:30 PM (Evening)" },
] as const;

export const SUGGESTED_CUSTOM_TIMES: readonly string[] = [
  "08:30 AM",
  "10:00 AM",
  "11:00 AM",
  "11:30 AM",
  "01:30 PM",
  "02:00 PM",
  "03:30 PM",
  "04:30 PM",
  "05:30 PM",
  "06:30 PM",
] as const;
