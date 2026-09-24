/**
 * Visit scheduling date & time validation utilities
 * Ensures local timezone accuracy (immune to UTC date shift) and strict prevention of past date/time bookings
 * while keeping all upcoming dates and operational future timings (7:00 AM – 7:00 PM) fully open and usable.
 */

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseTimeHoursMinutes(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const clean = timeStr.trim();

  // Try HH:MM AM/PM or HH:MM (e.g. 10:00 AM, 04:30 PM, 14:00, 10.30 AM)
  const colonMatch = clean.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
  if (colonMatch && colonMatch[1] && colonMatch[2]) {
    let hours = parseInt(colonMatch[1], 10);
    const minutes = parseInt(colonMatch[2], 10);
    const meridian = colonMatch[3]?.toUpperCase();
    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;
    // If no meridian specified and hours between 1 and 6, treat as afternoon PM (operating hours 7am - 7pm)
    if (!meridian && hours >= 1 && hours <= 6) hours += 12;
    return { hours, minutes };
  }

  // Try single hour e.g. "10 AM", "2 PM", "11pm", "5 PM"
  const hourMatch = clean.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (hourMatch && hourMatch[1] && hourMatch[2]) {
    let hours = parseInt(hourMatch[1], 10);
    const meridian = hourMatch[2].toUpperCase();
    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;
    return { hours, minutes: 0 };
  }

  return null;
}

export interface ClockTimeParts {
  hour12: number;
  minute: number;
  period: "AM" | "PM";
}

/**
 * Decomposes a time string into 12-hour parts (hours 1-12, minutes 0-59, AM/PM)
 */
export function splitTimeToHMP(timeStr: string): ClockTimeParts {
  const parsed = parseTimeHoursMinutes(timeStr);
  if (!parsed) {
    return { hour12: 10, minute: 0, period: "AM" };
  }
  const { hours, minutes } = parsed;
  const period: "AM" | "PM" = hours >= 12 ? "PM" : "AM";
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute: minutes, period };
}

/**
 * Recombines 12-hour parts into standard formatted time string, e.g. "10:30 AM"
 */
export function composeHMPToTime(hour12: number, minute: number, period: "AM" | "PM"): string {
  const h = String(hour12).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m} ${period}`;
}

/**
 * Converts 12-hour time parts to 24-hour total minutes from midnight
 */
export function timePartsToTotalMinutes(hour12: number, minute: number, period: "AM" | "PM"): number {
  let h24 = hour12 % 12;
  if (period === "PM") h24 += 12;
  return h24 * 60 + minute;
}

/**
 * Validates if time parts fall within daylight operational hours (7:00 AM – 7:00 PM)
 */
export function isWithinOperatingHours(hour12: number, minute: number, period: "AM" | "PM"): boolean {
  const totalMins = timePartsToTotalMinutes(hour12, minute, period);
  const openMins = 7 * 60; // 07:00 AM
  const closeMins = 19 * 60; // 07:00 PM (19:00)
  return totalMins >= openMins && totalMins <= closeMins;
}

/**
 * Check if a specific time has already passed for a selected date
 */
export function isSpecificTimePassed(
  hour12: number,
  minute: number,
  period: "AM" | "PM",
  selectedDate: string,
  now: Date = new Date(),
): boolean {
  if (!selectedDate) return false;
  const todayStr = getLocalDateString(now);
  const normDate = (selectedDate.includes("T") ? selectedDate.split("T")[0] : selectedDate).trim();

  // Future date is never passed
  if (normDate > todayStr) return false;
  // Past date is always passed
  if (normDate < todayStr) return true;

  // Selected date is TODAY
  const selectedMins = timePartsToTotalMinutes(hour12, minute, period);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return selectedMins <= nowMins;
}

/**
 * Checks if an entire hour (all 60 minutes) has passed for today
 */
export function isHourEntirelyPassed(
  hour12: number,
  period: "AM" | "PM",
  selectedDate: string,
  now: Date = new Date(),
): boolean {
  if (!selectedDate) return false;
  const todayStr = getLocalDateString(now);
  const normDate = (selectedDate.includes("T") ? selectedDate.split("T")[0] : selectedDate).trim();

  if (normDate > todayStr) return false;
  if (normDate < todayStr) return true;

  // For the hour to be entirely passed, even the last minute of this hour (:59) must be <= nowMins
  const lastMinOfHour = timePartsToTotalMinutes(hour12, 59, period);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return lastMinOfHour <= nowMins;
}

export function isTimePassedForDate(
  timeStr: string,
  selectedDate: string,
  now: Date = new Date(),
): boolean {
  if (!selectedDate) return false;
  const todayStr = getLocalDateString(now);

  // Normalize selectedDate (in case of full ISO string or extra whitespace)
  const normDate = (selectedDate.includes("T") ? selectedDate.split("T")[0] : selectedDate).trim();

  // If date is in the future, it is NEVER passed — all upcoming dates & timings are valid!
  if (normDate > todayStr) return false;

  // If date is in the past, it has already passed
  if (normDate < todayStr) return true;

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
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "11:30 AM",
  "01:00 PM",
  "02:00 PM",
  "03:30 PM",
  "04:30 PM",
  "05:30 PM",
  "06:00 PM",
] as const;
