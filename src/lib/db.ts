import type { Pool, PoolOptions } from "mysql2/promise";

let pool: Pool | null = null;

export function isMySQLConfigured(): boolean {
  if (typeof window !== "undefined") return false;
  return Boolean(
    process.env["DATABASE_URL"] ||
    process.env["MYSQL_URL"] ||
    (process.env["MYSQL_HOST"] && process.env["MYSQL_DATABASE"])
  );
}

export async function getDbPool(): Promise<Pool | null> {
  if (typeof window !== "undefined") return null;
  if (pool) return pool;

  if (!isMySQLConfigured()) {
    return null;
  }

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
    if (!db) return null;
    const [results] = await db.execute(sql, params);
    return results as T;
  } catch (err) {
    console.warn("MySQL query failed, falling back to local storage/file:", err);
    return null;
  }
}
