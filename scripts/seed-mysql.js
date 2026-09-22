#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

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
}

async function main() {
  loadEnv();

  console.log("--------------------------------------------------");
  console.log("  Galaxy Green - MySQL Migration & Seeding Tool   ");
  console.log("--------------------------------------------------");

  const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;
  let connection;

  const host = process.env.MYSQL_HOST || "localhost";
  const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;
  const user = process.env.MYSQL_USER || "root";
  const password = process.env.MYSQL_PASSWORD || "";
  const database = process.env.MYSQL_DATABASE || "galaxy_green";

  try {
    if (connectionUri) {
      const safeUri = connectionUri.replace(/:([^:@]+)@/, ":****@");
      console.log(`Connecting via DATABASE_URL: ${safeUri}`);

      // If database doesn't exist yet, connect to server without db first to create it
      try {
        connection = await mysql.createConnection({
          uri: connectionUri,
          multipleStatements: true,
        });
      } catch (connErr) {
        if (connErr.code === "ER_BAD_DB_ERROR") {
          // Parse URI without database name
          const parsed = new URL(connectionUri);
          const dbName = parsed.pathname.replace(/^\//, "");
          parsed.pathname = "";
          console.log(`Database '${dbName}' not found yet. Creating database '${dbName}'...`);
          const adminConn = await mysql.createConnection({
            uri: parsed.toString(),
          });
          await adminConn.query(
            `CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
          );
          await adminConn.end();

          // Reconnect with database
          connection = await mysql.createConnection({
            uri: connectionUri,
            multipleStatements: true,
          });
        } else {
          throw connErr;
        }
      }
    } else {
      console.log(`Connecting to MySQL host=${host}:${port}, user=${user}...`);
      // Connect without db first to ensure db exists
      const adminConn = await mysql.createConnection({
        host,
        port,
        user,
        password,
      });
      await adminConn.query(
        `CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      await adminConn.end();

      connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
        database,
        multipleStatements: true,
      });
    }

    console.log("Connected to MySQL successfully!");

    const sqlDumpPath = path.resolve(process.cwd(), "database/galaxy_green_mysql.sql");
    if (!fs.existsSync(sqlDumpPath)) {
      throw new Error(`SQL dump file not found at ${sqlDumpPath}`);
    }

    console.log("Executing database/galaxy_green_mysql.sql...");
    const sql = fs.readFileSync(sqlDumpPath, "utf-8");
    await connection.query(sql);

    // Verify plots count
    const [plotsRows] = await connection.query("SELECT COUNT(*) as count FROM plots");
    const [leadsRows] = await connection.query("SELECT COUNT(*) as count FROM inquiries");
    const [configRows] = await connection.query("SELECT * FROM admin_config WHERE id = 1");

    console.log(`\nMigration completed successfully!`);
    console.log(`- Plots seeded: ${plotsRows[0].count}`);
    console.log(`- Leads/Inquiries seeded: ${leadsRows[0].count}`);
    console.log(`- Dealer PIN: ${configRows[0]?.dealer_pin || "0000"}`);
    console.log("--------------------------------------------------");
  } catch (err) {
    const errCode = err.code || "ERROR";
    const errMsg = err.message || String(err);
    console.error(`\nMigration failed: [${errCode}] ${errMsg}`);

    if (errCode === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n[Notice]: Access denied. Check your MySQL user and password in .env.");
      console.log(
        "If using Homebrew MySQL with no password, set: DATABASE_URL=mysql://root@localhost:3306/galaxy_green",
      );
    } else if (errCode === "ECONNREFUSED") {
      console.log(`\n[Notice]: No MySQL server is listening at ${host}:${port}.`);
      console.log("Make sure your MySQL service is started with: brew services start mysql");
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
