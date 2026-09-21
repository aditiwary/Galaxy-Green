import { createServerFn } from "@tanstack/react-start";
import { plotSchema, type Plot } from "./plot-types";
import { executeQuery } from "./db";

function mapRowToPlot(row: any): Plot {
  return {
    id: row.id,
    number: row.number,
    sizeSqFt: Number(row.size_sq_ft),
    dimensions: row.dimensions,
    facing: row.facing,
    roadWidth: row.road_width,
    ratePerSqFt: Number(row.rate_per_sq_ft),
    status: row.status,
    feature: row.feature,
  };
}

async function getFsAndPath() {
  if (typeof window !== "undefined") return null;
  const fs = await import("node:fs");
  const path = await import("node:path");
  return { fs: fs.default, path: path.default };
}

async function readPlotsFromFile(): Promise<Plot[]> {
  try {
    const modules = await getFsAndPath();
    if (!modules) return [];
    const { fs, path } = modules;
    const file = path.resolve(process.cwd(), "data/plots.json");
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf-8");
      return JSON.parse(content) as Plot[];
    }
  } catch (err) {
    console.error("Error reading plots file:", err);
  }
  return [];
}

async function writePlotsToFile(plots: Plot[]): Promise<void> {
  try {
    const modules = await getFsAndPath();
    if (!modules) return;
    const { fs, path } = modules;
    const file = path.resolve(process.cwd(), "data/plots.json");
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file, JSON.stringify(plots, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing plots file:", err);
  }
}

export const getPlotsFn = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await executeQuery<any[]>("SELECT * FROM plots ORDER BY number ASC");
  if (rows !== null && Array.isArray(rows)) {
    return rows.map(mapRowToPlot);
  }

  console.warn("[MySQL] Not connected. Falling back to local JSON file.");
  return await readPlotsFromFile();
});

export const createPlotFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => plotSchema.parse(data))
  .handler(async ({ data }) => {
    const newPlot: Plot = {
      ...data,
      id: `plot-${Date.now()}`,
    };

    const res = await executeQuery(
      `INSERT INTO plots (id, number, size_sq_ft, dimensions, facing, road_width, rate_per_sq_ft, status, feature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newPlot.id,
        newPlot.number,
        newPlot.sizeSqFt,
        newPlot.dimensions,
        newPlot.facing,
        newPlot.roadWidth,
        newPlot.ratePerSqFt,
        newPlot.status,
        newPlot.feature,
      ]
    );

    if (res !== null) {
      console.log(`[MySQL] Plot ${newPlot.number} (${newPlot.id}) created in MySQL.`);
      return { success: true, plot: newPlot };
    }

    console.warn("[MySQL] Insert failed, falling back to local JSON file.");
    const plots = await readPlotsFromFile();
    plots.push(newPlot);
    await writePlotsToFile(plots);
    return { success: true, plot: newPlot };
  });

export const updatePlotStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: Plot["status"] }) => data)
  .handler(async ({ data }) => {
    const res = await executeQuery("UPDATE plots SET status = ? WHERE id = ?", [data.status, data.id]);
    if (res !== null) {
      console.log(`[MySQL] Plot ${data.id} status updated to ${data.status} in MySQL.`);
      return { success: true };
    }

    console.warn("[MySQL] Update failed, falling back to local JSON file.");
    const plots = await readPlotsFromFile();
    const target = plots.find((p) => p.id === data.id);
    if (target) {
      target.status = data.status;
      await writePlotsToFile(plots);
      return { success: true, plot: target };
    }
    return { success: false, error: "Plot not found" };
  });

export const deletePlotFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const res = await executeQuery("DELETE FROM plots WHERE id = ?", [data.id]);
    if (res !== null) {
      console.log(`[MySQL] Plot ${data.id} deleted from MySQL.`);
      return { success: true };
    }

    console.warn("[MySQL] Delete failed, falling back to local JSON file.");
    const plots = await readPlotsFromFile();
    const filtered = plots.filter((p) => p.id !== data.id);
    await writePlotsToFile(filtered);
    return { success: true };
  });
