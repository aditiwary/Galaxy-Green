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
    (process.env["MYSQL_HOST"] && process.env["MYSQL_DATABASE"]),
  );
}

let tablesEnsured = false;

async function ensureTablesExist(p: Pool): Promise<void> {
  if (tablesEnsured) return;
  tablesEnsured = true;

  try {
    // 1. Plots Table
    await p.execute(`
      CREATE TABLE IF NOT EXISTS \`plots\` (
        \`id\` VARCHAR(64) NOT NULL,
        \`number\` VARCHAR(32) NOT NULL,
        \`size_sq_ft\` INT UNSIGNED NOT NULL,
        \`dimensions\` VARCHAR(64) NOT NULL,
        \`facing\` ENUM('East', 'North', 'Park Facing', 'Boulevard Corner', 'West', 'South') NOT NULL,
        \`road_width\` VARCHAR(64) NOT NULL DEFAULT '30 ft Internal',
        \`rate_per_sq_ft\` DECIMAL(10, 2) NOT NULL DEFAULT 1199.00,
        \`status\` ENUM('Available', 'Fast Selling', 'Reserved', 'Sold Out') NOT NULL DEFAULT 'Available',
        \`feature\` TEXT NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_plot_number\` (\`number\`),
        KEY \`idx_plot_status\` (\`status\`),
        KEY \`idx_plot_size\` (\`size_sq_ft\`),
        KEY \`idx_plot_facing\` (\`facing\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Inquiries Table
    await p.execute(`
      CREATE TABLE IF NOT EXISTS \`inquiries\` (
        \`id\` VARCHAR(64) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`phone\` VARCHAR(20) NOT NULL,
        \`email\` VARCHAR(150) DEFAULT NULL,
        \`plot_preference\` VARCHAR(100) NOT NULL DEFAULT '1000 sq ft',
        \`visit_date\` DATE DEFAULT NULL,
        \`slot\` VARCHAR(50) NOT NULL DEFAULT 'Morning (10:00 AM)',
        \`cab_pickup\` TINYINT(1) NOT NULL DEFAULT 0,
        \`pickup_location\` VARCHAR(150) NOT NULL DEFAULT 'On Site',
        \`message\` TEXT DEFAULT NULL,
        \`status\` ENUM('New', 'Contacted', 'Visit Scheduled', 'Site Visit Done', 'Booked') NOT NULL DEFAULT 'New',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_inquiry_phone\` (\`phone\`),
        KEY \`idx_inquiry_status\` (\`status\`),
        KEY \`idx_inquiry_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Admin Config Table
    await p.execute(`
      CREATE TABLE IF NOT EXISTS \`admin_config\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`dealer_pin\` VARCHAR(255) NOT NULL DEFAULT '$2b$10$Wrh1A0qrl8UaDHSNPlgZveCf2IU9hXWTTAzh7WLHQ7umENxSbjqda',
        \`base_rate_per_sq_ft\` DECIMAL(10, 2) NOT NULL DEFAULT 1199.00,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Gallery Photos Table (LONGTEXT for high-res base64 images)
    await p.execute(`
      CREATE TABLE IF NOT EXISTS \`gallery_photos\` (
        \`id\` VARCHAR(64) NOT NULL,
        \`src\` LONGTEXT NOT NULL,
        \`title\` VARCHAR(150) NOT NULL,
        \`category\` VARCHAR(50) NOT NULL DEFAULT 'demarcation',
        \`category_label\` VARCHAR(100) NOT NULL DEFAULT 'Actual Site',
        \`tag\` VARCHAR(100) NOT NULL DEFAULT 'Live Photo',
        \`description\` TEXT,
        \`dimensions_label\` VARCHAR(100) DEFAULT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_photo_category\` (\`category\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure default admin_config row exists
    await p.execute(
      "INSERT IGNORE INTO admin_config (id, dealer_pin, base_rate_per_sq_ft) VALUES (1, '$2b$10$Wrh1A0qrl8UaDHSNPlgZveCf2IU9hXWTTAzh7WLHQ7umENxSbjqda', 1199.00)",
    );

    // Seed default gallery photos if empty
    const [photosCount] = await p.execute<Array<{ count: number }>>(
      "SELECT COUNT(*) as count FROM gallery_photos",
    );
    if (photosCount && photosCount[0] && Number(photosCount[0].count) === 0) {
      const defaultPhotos = [
        [
          "site-photo-1",
          "/site-photos/galaxy-green-actual-site-1.jpg",
          "Ground Demarcation & Boundary Pillars",
          "demarcation",
          "Demarcation & Registry Ready",
          "Phase 1 Demarcation",
          "Clear on-ground plot boundaries with reinforced stone pillars and concrete edging. Plots start from compact 600 sq ft up to large custom footprints.",
          "Min 600 sq ft to Custom Requirements",
        ],
        [
          "site-photo-2",
          "/site-photos/galaxy-green-actual-site-2.jpg",
          "Wide 30-Ft Internal Road & Sunset Streetlighting",
          "roads",
          "Internal Roads & Lighting",
          "30-Ft Road Infrastructure",
          "Wide, leveled internal township road network illuminated by active street lighting poles with utility pathways.",
          "30-Ft Wide Internal Avenue",
        ],
        [
          "site-photo-3",
          "/site-photos/galaxy-green-actual-site-3.jpg",
          "Elevated Township Panorama & Surrounding Greenery",
          "panorama",
          "Township Horizon",
          "Open Green Environs",
          "Panoramic elevated perspective of Sai Suraksha Nagar showing peaceful residential surroundings and overhead water infrastructure.",
          "Pollution-Free Eco Zone",
        ],
        [
          "site-photo-4",
          "/site-photos/galaxy-green-actual-site-4.jpg",
          "Main Access Boulevard & Plot Inventory Grid",
          "roads",
          "Boulevard & Demarcations",
          "Central Layout View",
          "Central access road traversing the plotted layout with clearly lined plot parcels ready for boundary walling.",
          "Allotment Starting ₹7.19 Lakh",
        ],
        [
          "site-photo-5",
          "/site-photos/galaxy-green-actual-site-5.jpg",
          "Underground Utility Lines & Soil Leveling Progress",
          "construction",
          "Civil Engineering",
          "Ground Work Active",
          "Active compaction and leveling machinery preparing future residential sectors with pre-laid drainage conduits.",
          "Phase 1 Fast-Track Delivery",
        ],
      ];
      for (const photo of defaultPhotos) {
        await p.execute(
          "INSERT IGNORE INTO gallery_photos (id, src, title, category, category_label, tag, description, dimensions_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          photo,
        );
      }
    }
  } catch (err) {
    console.error("[MySQL Schema Init Warning]:", err);
  }
}

export async function getDbPool(): Promise<Pool | null> {
  if (typeof window !== "undefined") return null;
  if (pool) return pool;
  await ensureEnv();

  try {
    const mysql = await import("mysql2/promise");
    const connectionUri = process.env["DATABASE_URL"] || process.env["MYSQL_URL"];

    if (connectionUri) {
      const isLocalhost =
        connectionUri.includes("localhost") || connectionUri.includes("127.0.0.1");
      const poolConfig: PoolOptions = {
        uri: connectionUri,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      };
      // If connecting to a remote cloud MySQL host and SSL isn't specified in URI, enable secure SSL
      if (!isLocalhost && !connectionUri.includes("ssl=")) {
        poolConfig.ssl = { rejectUnauthorized: false };
      }
      pool = mysql.createPool(poolConfig);
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

    if (pool) {
      await ensureTablesExist(pool);
    }

    return pool;
  } catch (err) {
    console.error("Failed to initialize MySQL connection pool:", err);
    return null;
  }
}

export type DbParam = string | number | boolean | Date | null | undefined;

export async function executeQuery<T = unknown>(
  sql: string,
  params: DbParam[] = [],
): Promise<T | null> {
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
