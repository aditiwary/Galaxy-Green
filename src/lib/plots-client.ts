import { DEFAULT_PLOTS, type Plot, type PlotInput } from "./plot-types";
import { getPlotsFn, createPlotFn, updatePlotStatusFn, deletePlotFn } from "./server-plots";

const PLOTS_STORAGE_KEY = "galaxy_green_plots_v1";

export async function fetchLivePlots(): Promise<Plot[]> {
  try {
    const serverPlots = await getPlotsFn();
    if (Array.isArray(serverPlots) && serverPlots.length > 0) {
      return serverPlots;
    }
  } catch (err) {
    console.warn("Using local storage fallback for plots:", err);
  }

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(PLOTS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as Plot[];
      } catch {
        // ignore
      }
    }
    localStorage.setItem(PLOTS_STORAGE_KEY, JSON.stringify(DEFAULT_PLOTS));
  }

  return DEFAULT_PLOTS;
}

export async function addLivePlot(input: PlotInput, token?: string): Promise<Plot> {
  let created: Plot | null = null;
  try {
    const res = await createPlotFn({ data: { plot: input, ...(token ? { token } : {}) } });
    if (res?.plot) created = res.plot;
  } catch (err) {
    console.warn("Server add plot fallback:", err);
  }

  if (!created) {
    created = {
      ...input,
      id: `plot-${Date.now()}`,
    };
  }

  if (typeof window !== "undefined") {
    try {
      const current = await fetchLivePlots();
      const updated = [...current, created];
      localStorage.setItem(PLOTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return created;
}

export async function setPlotStatus(
  id: string,
  status: Plot["status"],
  token?: string,
): Promise<boolean> {
  try {
    await updatePlotStatusFn({ data: { id, status, ...(token ? { token } : {}) } });
  } catch (err) {
    console.warn("Server plot status update fallback:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const current = await fetchLivePlots();
      const updated = current.map((p) => (p.id === id ? { ...p, status } : p));
      localStorage.setItem(PLOTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return true;
}

export async function removePlot(id: string, token?: string): Promise<boolean> {
  try {
    await deletePlotFn({ data: { id, ...(token ? { token } : {}) } });
  } catch (err) {
    console.warn("Server plot deletion fallback:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const current = await fetchLivePlots();
      const updated = current.filter((p) => p.id !== id);
      localStorage.setItem(PLOTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return true;
}
