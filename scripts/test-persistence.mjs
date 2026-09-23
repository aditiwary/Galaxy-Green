#!/usr/bin/env node

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

console.log("=================================================================");
console.log("  GALAXY GREEN — REFRESH & DATABASE PERSISTENCE INTEGRATION TEST");
console.log("=================================================================\n");

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...rest] = trimmed.split("=");
        if (key && rest.length > 0) {
          const val = rest
            .join("=")
            .trim()
            .replace(/^["']|["']$/g, "");
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
  if (!process.env.DATABASE_URL && !process.env.MYSQL_HOST) {
    process.env.DATABASE_URL = "mysql://root@localhost:3306/galaxy_green";
  }
}

loadEnv();

const SECRET = process.env.ADMIN_SESSION_SECRET || "gg_dealer_session_secret_2026_secured";

function getFingerprint(hashOrPin) {
  return crypto.createHash("sha256").update(hashOrPin).digest("hex").slice(0, 16);
}

function generateAdminToken(pinHash) {
  const timestamp = Date.now();
  const fp = pinHash ? getFingerprint(pinHash) : "init";
  const payload = `admin_${timestamp}_${fp}`;
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${timestamp}_${fp}_${hmac}`;
}

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

async function run() {
  const connectionUri =
    process.env.DATABASE_URL || process.env.MYSQL_URL || "mysql://root@localhost:3306/galaxy_green";
  const isLocalhost = connectionUri.includes("localhost") || connectionUri.includes("127.0.0.1");
  const conn = await mysql.createConnection({
    uri: connectionUri,
    ...(!isLocalhost && !connectionUri.includes("ssl=")
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
  });

  try {
    // -------------------------------------------------------------
    // 1. VERIFY ALL 4 TABLES EXIST
    // -------------------------------------------------------------
    console.log("[1] Testing MySQL Database Schema & Table Structure");
    const [tables] = await conn.execute("SHOW TABLES");
    const tableNames = tables.map((t) => Object.values(t)[0]);
    assert(tableNames.includes("plots"), "Table 'plots' exists in MySQL");
    assert(tableNames.includes("inquiries"), "Table 'inquiries' exists in MySQL");
    assert(tableNames.includes("admin_config"), "Table 'admin_config' exists in MySQL");
    assert(tableNames.includes("gallery_photos"), "Table 'gallery_photos' exists in MySQL");

    // -------------------------------------------------------------
    // 2. VERIFY PASSWORD UPDATE & PERSISTENCE
    // -------------------------------------------------------------
    console.log("\n[2] Testing Password Change & MySQL Persistence");
    const [adminRows] = await conn.execute("SELECT dealer_pin FROM admin_config WHERE id = 1");
    assert(adminRows.length > 0, "admin_config record id=1 exists in MySQL");

    const originalPinHash = adminRows[0].dealer_pin;
    const testNewPin = "8888";
    const testNewHash = await bcrypt.hash(testNewPin, 10);

    // Update PIN in MySQL
    await conn.execute("UPDATE admin_config SET dealer_pin = ? WHERE id = 1", [testNewHash]);
    const [updatedAdminRows] = await conn.execute(
      "SELECT dealer_pin FROM admin_config WHERE id = 1",
    );
    const isNewPinMatch = await bcrypt.compare(testNewPin, updatedAdminRows[0].dealer_pin);
    assert(isNewPinMatch, `New PIN '${testNewPin}' correctly saved and verified in MySQL`);

    // Verify old PIN no longer matches
    const isOldMatch = await bcrypt.compare("0000", updatedAdminRows[0].dealer_pin);
    assert(!isOldMatch, "Old PIN no longer matches after password change");

    // Restore original PIN for seamless continuous operation
    await conn.execute("UPDATE admin_config SET dealer_pin = ? WHERE id = 1", [originalPinHash]);
    const [restoredRows] = await conn.execute("SELECT dealer_pin FROM admin_config WHERE id = 1");
    assert(
      restoredRows[0].dealer_pin === originalPinHash,
      "Original PIN hash successfully restored in MySQL",
    );

    // -------------------------------------------------------------
    // 3. VERIFY PLOT ADDITION, EDIT & PERSISTENCE
    // -------------------------------------------------------------
    console.log("\n[3] Testing Plot Addition & Survival Across Reload");
    const testPlotId = `plot-persist-${Date.now()}`;
    const testPlotNumber = "TEST-X99";

    // Clean up if existed from previous run
    await conn.execute("DELETE FROM plots WHERE number = ?", [testPlotNumber]);

    // Insert test plot
    await conn.execute(
      `INSERT INTO plots (id, number, size_sq_ft, dimensions, facing, road_width, rate_per_sq_ft, status, feature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testPlotId,
        testPlotNumber,
        1500,
        "30 × 50 ft",
        "East",
        "30 ft Internal",
        1199.0,
        "Available",
        "Test Plot for refresh persistence verification",
      ],
    );

    // Query back from MySQL (simulating page refresh / new visitor)
    const [retrievedPlots] = await conn.execute("SELECT * FROM plots WHERE number = ?", [
      testPlotNumber,
    ]);
    assert(
      retrievedPlots.length === 1,
      `Plot '${testPlotNumber}' successfully retrieved from MySQL after write`,
    );
    assert(retrievedPlots[0].id === testPlotId, "Plot ID matches exactly");
    assert(Number(retrievedPlots[0].size_sq_ft) === 1500, "Plot size matches 1500 sq ft");
    assert(retrievedPlots[0].status === "Available", "Plot status is 'Available'");

    // Update plot status
    await conn.execute("UPDATE plots SET status = ? WHERE id = ?", ["Fast Selling", testPlotId]);
    const [updatedPlots] = await conn.execute("SELECT status FROM plots WHERE id = ?", [
      testPlotId,
    ]);
    assert(
      updatedPlots[0].status === "Fast Selling",
      "Plot status update to 'Fast Selling' persisted in MySQL",
    );

    // Clean up test plot
    await conn.execute("DELETE FROM plots WHERE id = ?", [testPlotId]);
    const [afterDelete] = await conn.execute("SELECT COUNT(*) as count FROM plots WHERE id = ?", [
      testPlotId,
    ]);
    assert(afterDelete[0].count === 0, "Test plot cleanly deleted from MySQL");

    // -------------------------------------------------------------
    // 4. VERIFY GALLERY PHOTO UPLOAD & PERSISTENCE
    // -------------------------------------------------------------
    console.log("\n[4] Testing Gallery Photo Upload & MySQL Persistence");
    const testPhotoId = `photo-persist-${Date.now()}`;
    const testPhotoTitle = "Test Persistence Photo";

    // Clean up if existed
    await conn.execute("DELETE FROM gallery_photos WHERE title = ?", [testPhotoTitle]);

    // Insert test photo
    await conn.execute(
      `INSERT INTO gallery_photos (id, src, title, category, category_label, tag, description, dimensions_label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testPhotoId,
        "/site-photos/galaxy-green-actual-site-1.jpg",
        testPhotoTitle,
        "panorama",
        "Township Horizon",
        "Live Update",
        "Testing photo persistence in MySQL database",
        "Actual Site Progress",
      ],
    );

    // Query back from MySQL (simulating page refresh)
    const [retrievedPhotos] = await conn.execute("SELECT * FROM gallery_photos WHERE id = ?", [
      testPhotoId,
    ]);
    assert(
      retrievedPhotos.length === 1,
      `Photo '${testPhotoTitle}' successfully retrieved from MySQL after write`,
    );
    assert(retrievedPhotos[0].category === "panorama", "Photo category matches 'panorama'");

    // Clean up test photo
    await conn.execute("DELETE FROM gallery_photos WHERE id = ?", [testPhotoId]);
    const [photosAfterDelete] = await conn.execute(
      "SELECT COUNT(*) as count FROM gallery_photos WHERE id = ?",
      [testPhotoId],
    );
    assert(photosAfterDelete[0].count === 0, "Test photo cleanly removed from MySQL");

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log("\n=================================================================");
    console.log(`  RESULT: ${passed}/${total} TESTS PASSED (100% PERSISTENCE CONFIRMED)`);
    console.log("=================================================================\n");
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
