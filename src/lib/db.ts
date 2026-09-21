import type { Pool, PoolOptions } from "mysql2/promise";

let pool: Pool | null = null;
let envChecked = false;

async function ensureEnv() {
  if (typeof window !== "undefined" || envChecked) return;
  envChecked = true;

  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...rest] = trimmed.split("=");
          if (key && rest.length > 0) {
            const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = val;
            }
          }
        }
      }
    }
  } catch {
    // ignore
  }

  if (!process.env["DATABASE_URL"] && !process.env["MYSQL_HOST"]) {
    process.env["DATABASE_URL"] = "mysql://root@localhost:3306/galaxy_green";
  }
}

export async function isMySQLConfigured(): Promise<boolean> {
  if (typeof window !== "undefined") return false;
  await ensureEnv();
  return Boolean(
    process.env["DATABASE_URL"] ||
    process.env["MYSQL_URL"] ||
    (process.env["MYSQL_HOST"] && process.env["MYSQL_DATABASE"])
  );
}

export async function getDbPool(): Promise<Pool | null> {
  if (typeof window !== "undefined") return null;
  if (pool) return pool;
  await ensureEnv();

  try {
    const mysql = await import("mysql2/promise");
    const connectionUri = process.env["DATABASE_URL"] || process.env["MYSQL_URL"];

    if (connectionUri) {
      pool = mysql.createPool({
        uri: connectionUri,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
    } else {
      const config: PoolOptions = {
        host: process.env["MYSQL_HOST"] || "localhost",
        port: process.env["MYSQL_PORT"] ? parseInt(process.env["MYSQL_PORT"], 10) : 3306,
        user: process.env["MYSQL_USER"] || "root",
        password: process.env["MYSQL_PASSWORD"] || "",
        database: process.env["MYSQL_DATABASE"] || "galaxy_green",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      };
      pool = mysql.createPool(config);
    }

    return pool;
  } catch (err) {
    console.error("Failed to initialize MySQL connection pool:", err);
    return null;
  }
}

export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  try {
    const db = await getDbPool();
    if (!db) {
      console.error("[MySQL Error] Database connection pool is not available.");
      return null;
    }
    const sanitizedParams = params.map((p) => (p === undefined ? null : p));
    const [results] = await db.execute(sql, sanitizedParams);
    return results as T;
  } catch (err) {
    console.error("[MySQL Query Error]:", err);
    return null;
  }
}
