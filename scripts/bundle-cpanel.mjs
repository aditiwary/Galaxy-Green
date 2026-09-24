import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

console.log("==========================================");
console.log("  Galaxy Green — cPanel Deployment Bundle ");
console.log("==========================================");

// 0. Ensure Brochure PDF is generated
console.log("0. Generating official PDF brochure...");
execSync("node scripts/generate-brochure-pdf.mjs", { stdio: "inherit" });

// 1. Build project for Node.js standalone server
console.log("1. Building standalone Node.js server with Nitro...");
execSync("NITRO_PRESET=node-server npm run build", { stdio: "inherit" });

// 2. Prepare staging folder
const distDir = path.resolve(process.cwd(), "cpanel-deploy");
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 3. Copy .output and public assets
console.log("2. Copying compiled .output and public assets to staging...");
execSync(`cp -R .output "${distDir}/"`);
execSync(`cp -R .output/public "${distDir}/public"`);

// 4. Create server.js (cPanel Passenger entry point)
const serverJs = `// cPanel / Phusion Passenger Node.js Startup File
import("./.output/server/index.mjs");
`;
fs.writeFileSync(path.join(distDir, "server.js"), serverJs, "utf-8");

// 5. Create cPanel package.json
const packageJson = {
  name: "galaxy-green",
  version: "1.0.0",
  type: "module",
  main: "server.js",
  scripts: {
    start: "node server.js"
  }
};
fs.writeFileSync(path.join(distDir, "package.json"), JSON.stringify(packageJson, null, 2), "utf-8");

// 6. Copy database schema for easy import in phpMyAdmin
fs.mkdirSync(path.join(distDir, "database"), { recursive: true });
fs.copyFileSync(
  path.resolve(process.cwd(), "database/galaxy_green_mysql.sql"),
  path.join(distDir, "database/galaxy_green_mysql.sql")
);

// 7. Zip the bundle
const zipName = "galaxygreen-cpanel.zip";
console.log(`3. Creating ${zipName}...`);
const zipPath = path.resolve(process.cwd(), zipName);
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

execSync(`cd "${distDir}" && zip -r "${zipPath}" .`, { stdio: "inherit" });
console.log("\n==========================================");
console.log(`[SUCCESS] Bundle created: ${zipName}`);
console.log("==========================================");
