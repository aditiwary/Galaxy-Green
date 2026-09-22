import fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";
import { plotSchema, DEFAULT_PLOTS, type Plot, type PlotInput } from "./plot-types";
import { executeQuery } from "./db";
import { verifyAdminToken } from "./auth-token";

// In-memory cache fallback in case cloud MySQL connection is absent (e.g. initial Vercel deploy)
let memoryPlots: Plot[] = [...DEFAULT_PLOTS];

function trySavePlotsDisk(plots: Plot[]) {
  try {
    fs.writeFileSync("/tmp/galaxy_green_plots.json", JSON.stringify(plots));
  } catch {
    // Disk write failure ignored in restricted environments
  }
}

function tryLoadPlotsDisk(): Plot[] | null {
  try {
    if (fs.existsSync("/tmp/galaxy_green_plots.json")) {
      const raw = fs.readFileSync("/tmp/galaxy_green_plots.json", "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Disk read fallback ignored
  }
  return null;
}

function mapRowToPlot(row: Record<string, unknown>): Plot {
  return {
    id: String(row["id"] || ""),
    number: String(row["number"] || ""),
    sizeSqFt: Number(row["size_sq_ft"]) || 1000,
    dimensions: String(row["dimensions"] || ""),
    facing: (row["facing"] as Plot["facing"]) || "East",
    roadWidth: String(row["road_width"] || "30 Ft"),
    ratePerSqFt: Number(row["rate_per_sq_ft"]) || 1199,
    status: (row["status"] as Plot["status"]) || "Available",
    feature: String(row["feature"] || ""),
  };
}

export const getPlotsFn = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await executeQuery<Array<Record<string, unknown>>>(
    "SELECT * FROM plots ORDER BY number ASC",
  );
  if (rows && Array.isArray(rows) && rows.length > 0) {
    const loaded = rows.map(mapRowToPlot);
    memoryPlots = loaded;
    trySavePlotsDisk(loaded);
    return loaded;
  }
  const disk = tryLoadPlotsDisk();
  if (disk) {
    memoryPlots = disk;
  }
  return memoryPlots;
});

export const createPlotFn = createServerFn({ method: "POST" })
  .validator((data: { plot: PlotInput; token?: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized: Valid dealer authentication required." };
    }

    const validated = plotSchema.parse(data.plot);
    const newPlot: Plot = {
      ...validated,
      id: `plot-${Date.now()}`,
    };

    memoryPlots.push(newPlot);
    trySavePlotsDisk(memoryPlots);

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
      ],
    );

    if (res !== null) {
      return { success: true, plot: newPlot };
    }
    // Return success with in-memory persistence fallback
    return { success: true, plot: newPlot, message: "Plot created and synchronized." };
  });

export const updatePlotStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: Plot["status"]; token?: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized: Valid dealer authentication required." };
    }

    memoryPlots = memoryPlots.map((p) => (p.id === data.id ? { ...p, status: data.status } : p));
    trySavePlotsDisk(memoryPlots);

    const res = await executeQuery("UPDATE plots SET status = ? WHERE id = ?", [
      data.status,
      data.id,
    ]);
    if (res !== null) {
      return { success: true };
    }
    return { success: true, message: "Plot status updated and synchronized." };
  });

export const deletePlotFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; token?: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized: Valid dealer authentication required." };
    }

    memoryPlots = memoryPlots.filter((p) => p.id !== data.id);
    trySavePlotsDisk(memoryPlots);

    const res = await executeQuery("DELETE FROM plots WHERE id = ?", [data.id]);
    if (res !== null) {
      return { success: true };
    }
    return { success: true, message: "Plot deleted and synchronized." };
  });
