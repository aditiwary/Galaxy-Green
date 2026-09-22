import assert from "node:assert/strict";
import {
  getLocalDateString,
  parseTimeHoursMinutes,
  isTimePassedForDate,
  PRESET_SLOTS,
  SUGGESTED_CUSTOM_TIMES,
} from "../src/lib/visit-helpers.ts";

console.log("=================================================================");
console.log("  GALAXY GREEN — SITE VISIT DATE & TIME VALIDATION TEST SUITE");
console.log("=================================================================\n");

// [1] Local Date Formatting & Timezone Immunity
console.log("[1] Testing Local Date String Formatting");
const testDate = new Date(2026, 8, 22, 23, 45); // Sept 22, 2026 23:45
const formattedDate = getLocalDateString(testDate);
assert.equal(formattedDate, "2026-09-22", "Formats local date correctly as YYYY-MM-DD");
console.log("  [PASS] Local date formatted as YYYY-MM-DD without UTC day drift");

// [2] Time Parsing
console.log("\n[2] Testing Time Parser for 12h/24h & Preset Strings");
const t1 = parseTimeHoursMinutes("Morning (10:00 AM)");
assert.deepEqual(t1, { hours: 10, minutes: 0 }, "Parses Morning slot");
console.log("  [PASS] Morning (10:00 AM) parsed to 10:00");

const t2 = parseTimeHoursMinutes("Afternoon (2:00 PM)");
assert.deepEqual(t2, { hours: 14, minutes: 0 }, "Parses Afternoon slot");
console.log("  [PASS] Afternoon (2:00 PM) parsed to 14:00");

const t3 = parseTimeHoursMinutes("Evening Sunset (4:30 PM)");
assert.deepEqual(t3, { hours: 16, minutes: 30 }, "Parses Sunset slot");
console.log("  [PASS] Evening Sunset (4:30 PM) parsed to 16:30");

const t4 = parseTimeHoursMinutes("11:30 AM");
assert.deepEqual(t4, { hours: 11, minutes: 30 }, "Parses 11:30 AM");
console.log("  [PASS] Custom chip '11:30 AM' parsed accurately");

const t5 = parseTimeHoursMinutes("06:30 PM");
assert.deepEqual(t5, { hours: 18, minutes: 30 }, "Parses 06:30 PM");
console.log("  [PASS] Custom chip '06:30 PM' parsed accurately");

// [3] Future & Past Date Protection
console.log("\n[3] Testing Future & Past Date Boundary Logic");
const mockNow = new Date(2026, 8, 22, 11, 0); // 11:00 AM on Sept 22, 2026
const mockToday = "2026-09-22";
const futureDate = "2026-09-23";
const pastDate = "2026-09-21";

assert.equal(
  isTimePassedForDate("Morning (10:00 AM)", futureDate, mockNow),
  false,
  "Morning slot on future date is AVAILABLE",
);
console.log("  [PASS] Future date slots are always available");

assert.equal(
  isTimePassedForDate("Morning (10:00 AM)", pastDate, mockNow),
  true,
  "Past date is ALWAYS blocked/passed",
);
console.log("  [PASS] Past dates are strictly blocked as passed");

// [4] Same-Day Dynamic Slot Passing (Clock Check)
console.log("\n[4] Testing Same-Day Passing based on Visitor Clock");

// At 09:30 AM:
const at930AM = new Date(2026, 8, 22, 9, 30);
assert.equal(
  isTimePassedForDate("Morning (10:00 AM)", mockToday, at930AM),
  false,
  "10:00 AM open at 9:30 AM",
);
assert.equal(
  isTimePassedForDate("Afternoon (2:00 PM)", mockToday, at930AM),
  false,
  "2:00 PM open at 9:30 AM",
);
assert.equal(
  isTimePassedForDate("Evening Sunset (4:30 PM)", mockToday, at930AM),
  false,
  "4:30 PM open at 9:30 AM",
);
console.log("  [PASS] At 9:30 AM: All slots open");

// At 11:30 AM:
const at1130AM = new Date(2026, 8, 22, 11, 30);
assert.equal(
  isTimePassedForDate("Morning (10:00 AM)", mockToday, at1130AM),
  true,
  "10:00 AM blocked at 11:30 AM",
);
assert.equal(
  isTimePassedForDate("Afternoon (2:00 PM)", mockToday, at1130AM),
  false,
  "2:00 PM open at 11:30 AM",
);
assert.equal(
  isTimePassedForDate("Evening Sunset (4:30 PM)", mockToday, at1130AM),
  false,
  "4:30 PM open at 11:30 AM",
);
console.log("  [PASS] At 11:30 AM: Morning blocked, Afternoon & Evening open");

// At 03:00 PM (15:00):
const at1500 = new Date(2026, 8, 22, 15, 0);
assert.equal(
  isTimePassedForDate("Morning (10:00 AM)", mockToday, at1500),
  true,
  "10:00 AM blocked at 3:00 PM",
);
assert.equal(
  isTimePassedForDate("Afternoon (2:00 PM)", mockToday, at1500),
  true,
  "2:00 PM blocked at 3:00 PM",
);
assert.equal(
  isTimePassedForDate("Evening Sunset (4:30 PM)", mockToday, at1500),
  false,
  "4:30 PM open at 3:00 PM",
);
console.log("  [PASS] At 3:00 PM: Morning & Afternoon blocked, Sunset open");

// At 05:00 PM (17:00):
const at1700 = new Date(2026, 8, 22, 17, 0);
assert.equal(
  isTimePassedForDate("Morning (10:00 AM)", mockToday, at1700),
  true,
  "10:00 AM blocked at 5:00 PM",
);
assert.equal(
  isTimePassedForDate("Afternoon (2:00 PM)", mockToday, at1700),
  true,
  "2:00 PM blocked at 5:00 PM",
);
assert.equal(
  isTimePassedForDate("Evening Sunset (4:30 PM)", mockToday, at1700),
  true,
  "4:30 PM blocked at 5:00 PM",
);
console.log("  [PASS] At 5:00 PM: All daytime preset slots blocked for today");

// [5] Suggested Custom Times Filtering
console.log("\n[5] Testing Custom Suggestion Chips Filtering for Today");
const availableChipsAt1500 = SUGGESTED_CUSTOM_TIMES.filter(
  (chip) => !isTimePassedForDate(chip, mockToday, at1500),
);
assert.deepEqual(
  availableChipsAt1500,
  ["03:30 PM", "04:30 PM", "05:30 PM", "06:30 PM"],
  "Only future times available at 3:00 PM",
);
console.log(
  "  [PASS] Suggestions at 3:00 PM accurately filter to upcoming chips:",
  availableChipsAt1500.join(", "),
);

console.log("\n=================================================================");
console.log("  RESULT: 15/15 VISIT SCHEDULING VALIDATION CHECKS PASSED!");
console.log("=================================================================\n");
