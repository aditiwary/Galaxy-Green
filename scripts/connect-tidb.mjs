#!/usr/bin/env node

import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";

const connectionUri = process.argv[2] || process.env.DATABASE_URL;

if (!connectionUri) {
  console.error("Usage: node scripts/connect-tidb.mjs <DATABASE_URL>");
  process.exit(1);
}

async function run() {
  console.log("--------------------------------------------------");
  console.log("  Galaxy Green — TiDB Cloud Provisioning & Setup   ");
  console.log("--------------------------------------------------");

  const isLocalhost = connectionUri.includes("localhost") || connectionUri.includes("127.0.0.1");
  const ssl =
    !isLocalhost && !connectionUri.includes("ssl=") ? { rejectUnauthorized: false } : undefined;

  let conn;
  try {
    console.log("1. Connecting to TiDB Cloud gateway...");
    const parsed = new URL(connectionUri);
    const targetDb = parsed.pathname.replace(/^\//, "") || "galaxy_green";
    parsed.pathname = "/test"; // connect to default test database first

    const initConn = await mysql.createConnection({
      uri: parsed.toString(),
      connectTimeout: 20000,
      ...(ssl ? { ssl } : {}),
    });
    console.log("   [SUCCESS] Connected to gateway.");

    console.log(`2. Creating '${targetDb}' database if not exists...`);
    await initConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${targetDb}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await initConn.end();
    console.log(`   [SUCCESS] '${targetDb}' database ready.`);

    console.log(`3. Connecting directly to '${targetDb}'...`);
    conn = await mysql.createConnection({
      uri: connectionUri,
      multipleStatements: true,
      connectTimeout: 20000,
      ...(ssl ? { ssl } : {}),
    });
    console.log(`   [SUCCESS] Connected to '${targetDb}'.`);

    console.log("3. Creating tables from schema...");
    const schemaPath = path.resolve(process.cwd(), "database/schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    await conn.query(schemaSql);
    console.log(
      "   [SUCCESS] All tables created (plots, inquiries, admin_config, gallery_photos).",
    );

    console.log("4. Verifying default plots and configuration...");
    const [plotRows] = await conn.query("SELECT COUNT(*) as count FROM plots");
    console.log(`   [INFO] Plots in database: ${plotRows[0]?.count || 0}`);

    if (plotRows[0]?.count === 0) {
      console.log("   Seeding default plots...");
      const seedSqlPath = path.resolve(process.cwd(), "database/galaxy_green_mysql.sql");
      if (fs.existsSync(seedSqlPath)) {
        const seedSql = fs.readFileSync(seedSqlPath, "utf-8");
        await conn.query(seedSql);
        console.log("   [SUCCESS] Seed data loaded into cloud database!");
      }
    }

    await conn.end();

    // Update local .env
    const envPath = path.resolve(process.cwd(), ".env");
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
    if (envContent.includes("DATABASE_URL=")) {
      envContent = envContent.replace(
        /DATABASE_URL=.*(\r?\n|$)/,
        `DATABASE_URL="${connectionUri}"$1`,
      );
    } else {
      envContent += `\nDATABASE_URL="${connectionUri}"\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf-8");
    console.log("5. Updated local .env with cloud DATABASE_URL.");

    console.log("\n==================================================");
    console.log("  ALL DONE! CLOUD DATABASE IS FULLY INITIALIZED!  ");
    console.log("==================================================");
  } catch (err) {
    console.error("\n[ERROR] Connection failed:", err.message);
    if (conn) await conn.end();
    process.exit(1);
  }
}

run();
