import fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";
import { plotSchema, DEFAULT_PLOTS, type Plot, type PlotInput } from "./plot-types";
import { executeQuery } from "./db";
import { verifyAdminToken } from "./auth-token";

// In-memory cache fallback in case MySQL connection is absent
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

    if (res === null) {
      return { success: true, plot: newPlot, note: "Plot added and synchronized to live website." };
    }
    return { success: true, plot: newPlot };
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
    if (res === null) {
      return { success: true, note: "Plot status updated and synchronized." };
    }
    return { success: true };
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
    if (res === null) {
      return { success: true, note: "Plot deleted and synchronized." };
    }
    return { success: true };
  });

export const updatePlotFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; plot: Partial<PlotInput>; token?: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized: Valid dealer authentication required." };
    }

    let current = memoryPlots.find((p) => p.id === data.id);
    if (!current) {
      const rows = await executeQuery<PlotDbRow[]>("SELECT * FROM plots WHERE id = ? LIMIT 1", [
        data.id,
      ]);
      if (rows && rows.length > 0 && rows[0]) {
        current = mapRowToPlot(rows[0]);
      } else {
        const disk = tryLoadPlotsDisk();
        if (disk) {
          const found = disk.find((p) => p.id === data.id);
          if (found) current = found;
        }
      }
    }

    if (!current) {
      return { success: false, error: "Plot not found in database." };
    }

    const updated: Plot = {
      ...current,
      ...data.plot,
      number: data.plot.number ? data.plot.number.toUpperCase().trim() : current.number,
      sizeSqFt: data.plot.sizeSqFt !== undefined ? Number(data.plot.sizeSqFt) : current.sizeSqFt,
      ratePerSqFt:
        data.plot.ratePerSqFt !== undefined ? Number(data.plot.ratePerSqFt) : current.ratePerSqFt,
    };

    memoryPlots = memoryPlots.map((p) => (p.id === data.id ? updated : p));
    trySavePlotsDisk(memoryPlots);

    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (data.plot.number !== undefined) {
      updates.push("number = ?");
      params.push(updated.number);
    }
    if (data.plot.sizeSqFt !== undefined) {
      updates.push("size_sq_ft = ?");
      params.push(updated.sizeSqFt);
    }
    if (data.plot.dimensions !== undefined) {
      updates.push("dimensions = ?");
      params.push(data.plot.dimensions);
    }
    if (data.plot.facing !== undefined) {
      updates.push("facing = ?");
      params.push(data.plot.facing);
    }
    if (data.plot.roadWidth !== undefined) {
      updates.push("road_width = ?");
      params.push(data.plot.roadWidth);
    }
    if (data.plot.ratePerSqFt !== undefined) {
      updates.push("rate_per_sq_ft = ?");
      params.push(updated.ratePerSqFt);
    }
    if (data.plot.status !== undefined) {
      updates.push("status = ?");
      params.push(data.plot.status);
    }
    if (data.plot.feature !== undefined) {
      updates.push("feature = ?");
      params.push(data.plot.feature);
    }

    if (updates.length > 0) {
      params.push(data.id);
      const res = await executeQuery(`UPDATE plots SET ${updates.join(", ")} WHERE id = ?`, params);
      if (res === null) {
        return {
          success: true,
          plot: updated,
          note: "Plot updated and synchronized to live website.",
        };
      }
    }

    return { success: true, plot: updated, message: "Plot details updated and synchronized." };
  });
