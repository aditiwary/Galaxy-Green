import { DEFAULT_PLOTS, type Plot, type PlotInput } from "./plot-types";
import {
  getPlotsFn,
  createPlotFn,
  updatePlotStatusFn,
  deletePlotFn,
  updatePlotFn,
} from "./server-plots";

const PLOTS_STORAGE_KEY = "galaxy_green_plots_v1";

export async function fetchLivePlots(): Promise<Plot[]> {
  try {
    const serverPlots = await getPlotsFn();
    if (Array.isArray(serverPlots) && serverPlots.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem(PLOTS_STORAGE_KEY, JSON.stringify(serverPlots));
      }
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

function getClientToken(token?: string): string | undefined {
  if (token) return token;
  if (typeof window !== "undefined") {
    return (
      sessionStorage.getItem("gg_dealer_token") ||
      localStorage.getItem("gg_dealer_token") ||
      undefined
    );
  }
  return undefined;
}

export async function addLivePlot(input: PlotInput, token?: string): Promise<Plot | null> {
  const activeToken = getClientToken(token);
  try {
    const res = await createPlotFn({
      data: { plot: input, ...(activeToken ? { token: activeToken } : {}) },
    });
    if (res?.success && res.plot) {
      if (typeof window !== "undefined") {
        try {
          const current = await fetchLivePlots();
          const updated = [...current.filter((p) => p.id !== res.plot.id), res.plot];
          localStorage.setItem(PLOTS_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return res.plot;
    }
    if (res?.error) {
      console.error("Failed to add plot to database:", res.error);
    }
  } catch (err) {
    console.error("Server add plot error:", err);
  }
  return null;
}

export async function setPlotStatus(
  id: string,
  status: Plot["status"],
  token?: string,
): Promise<boolean> {
  const activeToken = getClientToken(token);
  try {
    const res = await updatePlotStatusFn({
      data: { id, status, ...(activeToken ? { token: activeToken } : {}) },
    });
    if (res?.success) {
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
  } catch (err) {
    console.error("Server plot status update error:", err);
  }
  return false;
}

export async function removePlot(id: string, token?: string): Promise<boolean> {
  const activeToken = getClientToken(token);
  try {
    const res = await deletePlotFn({
      data: { id, ...(activeToken ? { token: activeToken } : {}) },
    });
    if (res?.success) {
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
  } catch (err) {
    console.error("Server plot deletion error:", err);
  }
  return false;
}

export async function updateLivePlot(
  id: string,
  plotUpdates: Partial<PlotInput>,
  token?: string,
): Promise<Plot | null> {
  const activeToken = getClientToken(token);
  try {
    const res = await updatePlotFn({
      data: { id, plot: plotUpdates, ...(activeToken ? { token: activeToken } : {}) },
    });
    if (res?.success && res.plot) {
      if (typeof window !== "undefined") {
        try {
          const current = await fetchLivePlots();
          const updatedList = current.map((p) => (p.id === id ? res.plot : p));
          localStorage.setItem(PLOTS_STORAGE_KEY, JSON.stringify(updatedList));
        } catch {
          // ignore
        }
      }
      return res.plot;
    }
  } catch (err) {
    console.error("Server plot update error:", err);
  }
  return null;
}
