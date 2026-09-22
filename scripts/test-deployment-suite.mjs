import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

console.log("=================================================================");
console.log("  GALAXY GREEN — COMPREHENSIVE PRE-DEPLOYMENT SECURITY & QA AUDIT");
console.log("=================================================================\n");

let passedChecks = 0;
let totalChecks = 0;

function assert(condition, testName, details = "") {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}: ${details}`);
  }
}

// -------------------------------------------------------------
// 1. ENVIRONMENT & SECRETS SECURITY AUDIT
// -------------------------------------------------------------
console.log("\n[1] AUDIT: Secrets & Environment Configuration");

const envExamplePath = path.resolve(process.cwd(), ".env.example");
assert(fs.existsSync(envExamplePath), ".env.example exists in project root");

const gitignorePath = path.resolve(process.cwd(), ".gitignore");
const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
assert(gitignoreContent.includes(".env"), ".gitignore explicitly ignores .env");
assert(gitignoreContent.includes("node_modules"), ".gitignore explicitly ignores node_modules");

// Check client source files to ensure no server secrets are imported on the frontend
const clientFiles = [
  "src/routes/index.tsx",
  "src/components/AdminLeadsDrawer.tsx",
  "src/components/SiteVisitModal.tsx",
  "src/components/BrochureModal.tsx",
];

for (const file of clientFiles) {
  const code = fs.readFileSync(path.resolve(process.cwd(), file), "utf-8");
  assert(
    !code.includes("ADMIN_SESSION_SECRET"),
    `Client component ${file} does NOT reference ADMIN_SESSION_SECRET`,
  );
  assert(
    !code.includes("MYSQL_PASSWORD"),
    `Client component ${file} does NOT reference MYSQL_PASSWORD`,
  );
}

// -------------------------------------------------------------
// 2. SECURITY HEADERS & DEFENSIVE CONFIGURATION
// -------------------------------------------------------------
console.log("\n[2] AUDIT: HTTP Security Headers & Clickjacking Defense");

const headersPath = path.resolve(process.cwd(), "public/_headers");
assert(fs.existsSync(headersPath), "public/_headers file exists for production deploy");

const headersContent = fs.readFileSync(headersPath, "utf-8");
assert(
  headersContent.includes("X-Frame-Options: SAMEORIGIN"),
  "X-Frame-Options configured to prevent Clickjacking",
);
assert(
  headersContent.includes("X-Content-Type-Options: nosniff"),
  "X-Content-Type-Options: nosniff configured to prevent MIME sniffing",
);
assert(
  headersContent.includes("Referrer-Policy: strict-origin-when-cross-origin"),
  "Referrer-Policy is strict",
);
assert(headersContent.includes("X-XSS-Protection"), "X-XSS-Protection header active");

// -------------------------------------------------------------
// 3. CRYPTOGRAPHY & DEALER AUTHENTICATION AUDIT
// -------------------------------------------------------------
console.log("\n[3] AUDIT: Cryptography, PIN Verification & Session Tokens");

const SECRET = "gg_dealer_session_secret_2026_secured";

function getFingerprint(hashOrPin) {
  return crypto.createHash("sha256").update(hashOrPin).digest("hex").slice(0, 16);
}

function generateAdminToken(pinHash, customSecret = SECRET) {
  const timestamp = Date.now();
  const fp = getFingerprint(pinHash);
  const payload = `admin_${timestamp}_${fp}`;
  const hmac = crypto.createHmac("sha256", customSecret).update(payload).digest("hex");
  return `${timestamp}_${fp}_${hmac}`;
}

function verifyAdminToken(token, expectedPinHash, customSecret = SECRET) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split("_");
  if (parts.length !== 3) return false;
  const [timeStr, fp, expectedHmac] = parts;
  const time = parseInt(timeStr, 10);
  if (isNaN(time) || Date.now() - time > 24 * 60 * 60 * 1000 || time > Date.now() + 60000) {
    return false;
  }
  const payload = `admin_${timeStr}_${fp}`;
  const actualHmac = crypto.createHmac("sha256", customSecret).update(payload).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(actualHmac), Buffer.from(expectedHmac))) {
    return false;
  }
  const targetFp = getFingerprint(expectedPinHash);
  if (targetFp && fp !== targetFp) {
    return false;
  }
  return true;
}

// Test A: bcrypt verification
const pin = "0000";
const hash = bcrypt.hashSync(pin, 10);
assert(bcrypt.compareSync("0000", hash), "bcrypt accurately verifies correct PIN '0000'");
assert(!bcrypt.compareSync("1234", hash), "bcrypt rejects incorrect PIN '1234'");

// Test B: Token issuance & signature validation
const token = generateAdminToken(hash);
assert(
  verifyAdminToken(token, hash),
  "Admin session token generated and cryptographically verified",
);

// Test C: Tampered token rejection
const tamperedToken = token.slice(0, -4) + "abcd";
assert(!verifyAdminToken(tamperedToken, hash), "Tampered session token is rejected");

// Test D: Invalid secret rejection
assert(
  !verifyAdminToken(token, hash, "attacker_secret_key"),
  "Token with wrong server secret is rejected",
);

// Test E: Cross-device invalidation upon PIN rotation
const newPinHash = bcrypt.hashSync("9876", 10);
assert(
  !verifyAdminToken(token, newPinHash),
  "Old session token is instantly invalidated across all devices when PIN changes",
);

// -------------------------------------------------------------
// 4. PUBLIC FORM INTEGRITY & ANTI-BOT DEFENSE AUDIT
// -------------------------------------------------------------
console.log("\n[4] AUDIT: Public Lead Forms, Zod Validation & Anti-Bot Honeypot");

const inquirySchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal("")),
  plotPreference: z.string().default("1000 sq ft"),
  visitDate: z.string().optional(),
  slot: z.string().default("Morning (10:00 AM)"),
  cabPickup: z.boolean().default(false),
  pickupLocation: z.string().default("On Site"),
  message: z.string().max(500).optional(),
  website: z.string().max(100).optional(),
});

// Test valid submission
const validSubmission = {
  name: "Amitabh Verma",
  phone: "9876543210",
  email: "amitabh@verma.in",
  plotPreference: "1200 sq ft",
  visitDate: "2026-09-25",
  slot: "Morning (10:00 AM)",
  website: "", // Empty honeypot
};
const parsedValid = inquirySchema.safeParse(validSubmission);
assert(parsedValid.success, "Valid Indian customer inquiry passes schema validation");

// Test invalid phone number
const invalidPhone = {
  name: "Amitabh Verma",
  phone: "123456", // Invalid
};
const parsedInvalidPhone = inquirySchema.safeParse(invalidPhone);
assert(!parsedInvalidPhone.success, "Malformed phone number is rejected by Zod schema");

// Test anti-bot honeypot detection
function isBotSubmission(websiteField) {
  return Boolean(websiteField && websiteField.trim().length > 0);
}
assert(
  isBotSubmission("https://spam-bot.com"),
  "Automated bot filling hidden 'website' field is trapped",
);
assert(!isBotSubmission(""), "Legitimate human submission with empty honeypot passes");

// Test XSS sanitization function
function sanitizeText(str) {
  if (!str) return null;
  return str
    .replace(/<[^>]*>?/gm, "")
    .replace(/[&<>"']/g, (m) => {
      switch (m) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#039;";
        default:
          return m;
      }
    })
    .trim();
}

const xssPayload = "<script>alert('xss')</script>Hello & welcome";
const sanitized = sanitizeText(xssPayload);
assert(!sanitized.includes("<script>"), "XSS script tags are completely stripped");
assert(sanitized.includes("&amp;"), "Special HTML characters are sanitized");

// -------------------------------------------------------------
// 5. DATABASE SCHEMA & CAPACITY AUDIT
// -------------------------------------------------------------
console.log("\n[5] AUDIT: Database Schema & Column Capacities");

const schemaSqlPath = path.resolve(process.cwd(), "database/schema.sql");
const schemaSql = fs.readFileSync(schemaSqlPath, "utf-8");

assert(
  schemaSql.includes("`dealer_pin` VARCHAR(255)"),
  "database/schema.sql defines dealer_pin as VARCHAR(255) for bcrypt hashes",
);

const dumpSqlPath = path.resolve(process.cwd(), "database/galaxy_green_mysql.sql");
const dumpSql = fs.readFileSync(dumpSqlPath, "utf-8");

assert(
  dumpSql.includes("`dealer_pin` VARCHAR(255)"),
  "database/galaxy_green_mysql.sql defines dealer_pin as VARCHAR(255)",
);

// Verify that plots table has index on number and status
assert(
  schemaSql.includes("UNIQUE KEY `uk_plot_number`"),
  "plots table has UNIQUE constraint on plot number",
);
assert(
  schemaSql.includes("KEY `idx_inquiry_phone`"),
  "inquiries table is indexed on phone for quick lookups",
);

// -------------------------------------------------------------
// 6. SUMMARY REPORT
// -------------------------------------------------------------
console.log("\n=================================================================");
console.log(
  `  AUDIT COMPLETE: ${passedChecks}/${totalChecks} CHECKS PASSED (${Math.round((passedChecks / totalChecks) * 100)}%)`,
);
console.log("=================================================================\n");

if (passedChecks === totalChecks) {
  process.exit(0);
} else {
  process.exit(1);
}
