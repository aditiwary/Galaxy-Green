import { createServerFn } from "@tanstack/react-start";
import { plotSchema, DEFAULT_PLOTS, type Plot, type PlotInput } from "./plot-types";
import { executeQuery } from "./db";
import { verifyAdminToken } from "./auth-token";

// In-memory cache fallback in case cloud MySQL connection is absent (e.g. initial Vercel deploy)
let memoryPlots: Plot[] = [...DEFAULT_PLOTS];

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

export const getPlotsFn = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await executeQuery<any[]>("SELECT * FROM plots ORDER BY number ASC");
  if (rows && Array.isArray(rows) && rows.length > 0) {
    const loaded = rows.map(mapRowToPlot);
    memoryPlots = loaded;
    return loaded;
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
      return { success: true, plot: newPlot };
    }
    // Return success with in-memory persistence fallback
    return { success: true, plot: newPlot, warning: "Plot created in session cache (MySQL offline)." };
  });

export const updatePlotStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: Plot["status"]; token?: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized: Valid dealer authentication required." };
    }

    memoryPlots = memoryPlots.map((p) => (p.id === data.id ? { ...p, status: data.status } : p));

    const res = await executeQuery("UPDATE plots SET status = ? WHERE id = ?", [data.status, data.id]);
    if (res !== null) {
      return { success: true };
    }
    return { success: true, warning: "Plot status updated in session cache (MySQL offline)." };
  });

export const deletePlotFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; token?: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized: Valid dealer authentication required." };
    }

    memoryPlots = memoryPlots.filter((p) => p.id !== data.id);

    const res = await executeQuery("DELETE FROM plots WHERE id = ?", [data.id]);
    if (res !== null) {
      return { success: true };
    }
    return { success: true, warning: "Plot deleted from session cache (MySQL offline)." };
  });
