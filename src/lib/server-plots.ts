import { createServerFn } from "@tanstack/react-start";
import { plotSchema, type Plot, type PlotInput } from "./plot-types";
import { executeQuery } from "./db";
import { verifyAdminToken } from "./auth-token";

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
  if (rows && Array.isArray(rows)) {
    return rows.map(mapRowToPlot);
  }
  return [];
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
    return { success: false, error: "Failed to create plot in MySQL" };
  });

export const updatePlotStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: Plot["status"]; token?: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized: Valid dealer authentication required." };
    }

    const res = await executeQuery("UPDATE plots SET status = ? WHERE id = ?", [data.status, data.id]);
    if (res !== null) {
      return { success: true };
    }
    return { success: false, error: "Failed to update plot status in MySQL" };
  });

export const deletePlotFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; token?: string }) => data)
  .handler(async ({ data }) => {
    if (!verifyAdminToken(data.token)) {
      return { success: false, error: "Unauthorized: Valid dealer authentication required." };
    }

    const res = await executeQuery("DELETE FROM plots WHERE id = ?", [data.id]);
    if (res !== null) {
      return { success: true };
    }
    return { success: false, error: "Failed to delete plot from MySQL" };
  });
