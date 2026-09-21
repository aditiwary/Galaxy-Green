import { createServerFn } from "@tanstack/react-start";
import { plotSchema, type Plot } from "./plot-types";

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
  return await readPlotsFromFile();
});

export const createPlotFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => plotSchema.parse(data))
  .handler(async ({ data }) => {
    const plots = await readPlotsFromFile();
    const newPlot: Plot = {
      ...data,
      id: `plot-${Date.now()}`,
    };
    plots.push(newPlot);
    await writePlotsToFile(plots);
    return { success: true, plot: newPlot };
  });

export const updatePlotStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: Plot["status"] }) => data)
  .handler(async ({ data }) => {
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
    const plots = await readPlotsFromFile();
    const filtered = plots.filter((p) => p.id !== data.id);
    await writePlotsToFile(filtered);
    return { success: true };
  });
