#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

async function main() {
  console.log("--------------------------------------------------");
  console.log("  Galaxy Green - MySQL Migration & Seeding Tool   ");
  console.log("--------------------------------------------------");

  const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;
  let connection;

  try {
    if (connectionUri) {
      console.log(`Connecting via DATABASE_URL...`);
      connection = await mysql.createConnection({
        uri: connectionUri,
        multipleStatements: true,
      });
    } else {
      const host = process.env.MYSQL_HOST || "localhost";
      const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;
      const user = process.env.MYSQL_USER || "root";
      const password = process.env.MYSQL_PASSWORD || "";
      const database = process.env.MYSQL_DATABASE || "galaxy_green";

      console.log(`Connecting to MySQL host=${host}:${port}, user=${user}, database=${database}...`);
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
    console.log(`- Dealer PIN: ${configRows[0]?.dealer_pin || "9044"}`);
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("\nMigration failed:", err.message);
    console.log("\nMake sure your MySQL server is running and credentials in .env are correct.");
    console.log("Alternatively, import database/galaxy_green_mysql.sql directly into phpMyAdmin or MySQL Workbench.");
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
