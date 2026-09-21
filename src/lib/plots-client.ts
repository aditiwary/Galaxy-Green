import type { Plot, PlotInput } from "./plot-types";
import {
  getPlotsFn,
  createPlotFn,
  updatePlotStatusFn,
  deletePlotFn,
} from "./server-plots";

const PLOTS_STORAGE_KEY = "galaxy_green_plots_v1";

const DEFAULT_PLOTS: Plot[] = [
  {
    id: "plot-a1",
    number: "A-101",
    sizeSqFt: 1000,
    dimensions: "25 × 40 ft",
    facing: "East",
    roadWidth: "30 ft Internal",
    ratePerSqFt: 1400,
    status: "Available",
    feature: "Ideal for 3BHK compact luxury independent duplex.",
  },
  {
    id: "plot-a2",
    number: "A-102",
    sizeSqFt: 1000,
    dimensions: "25 × 40 ft",
    facing: "North",
    roadWidth: "30 ft Internal",
    ratePerSqFt: 1400,
    status: "Fast Selling",
    feature: "Vastu-compliant entrance with clear morning sunlight.",
  },
  {
    id: "plot-b1",
    number: "B-201",
    sizeSqFt: 1200,
    dimensions: "30 × 40 ft",
    facing: "Park Facing",
    roadWidth: "30 ft Internal",
    ratePerSqFt: 1400,
    status: "Fast Selling",
    feature: "Direct unobstructed view of central green park & jogging trail.",
  },
  {
    id: "plot-b2",
    number: "B-205",
    sizeSqFt: 1500,
    dimensions: "30 × 50 ft",
    facing: "East",
    roadWidth: "30 ft Internal",
    ratePerSqFt: 1400,
    status: "Available",
    feature: "Generous frontage for double-car porch and front garden.",
  },
  {
    id: "plot-c1",
    number: "C-301",
    sizeSqFt: 2000,
    dimensions: "40 × 50 ft",
    facing: "Park Facing",
    roadWidth: "40 ft Boulevard",
    ratePerSqFt: 1400,
    status: "Available",
    feature: "Premium estate plot overlooking clubhouse & landscaped water body.",
  },
  {
    id: "plot-c2",
    number: "C-308",
    sizeSqFt: 2000,
    dimensions: "40 × 50 ft",
    facing: "Boulevard Corner",
    roadWidth: "40 ft × 30 ft Dual Road",
    ratePerSqFt: 1450,
    status: "Fast Selling",
    feature: "Two-side open corner plot with grand boulevard visibility.",
  },
  {
    id: "plot-d1",
    number: "D-401",
    sizeSqFt: 3000,
    dimensions: "50 × 60 ft",
    facing: "Boulevard Corner",
    roadWidth: "40 ft Main Avenue",
    ratePerSqFt: 1450,
    status: "Reserved",
    feature: "Ultra-luxury mansion plot with private swimming pool clearance.",
  },
  {
    id: "plot-d2",
    number: "D-405",
    sizeSqFt: 1000,
    dimensions: "25 × 40 ft",
    facing: "North",
    roadWidth: "30 ft Internal",
    ratePerSqFt: 1400,
    status: "Available",
    feature: "Prime location near security entrance and visitor parking.",
  },
];

export async function fetchLivePlots(): Promise<Plot[]> {
  try {
    const serverPlots = await getPlotsFn();
    if (Array.isArray(serverPlots)) {
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

export async function addLivePlot(input: PlotInput): Promise<Plot> {
  let created: Plot | null = null;
  try {
    const res = await createPlotFn({ data: input });
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
  status: Plot["status"]
): Promise<boolean> {
  try {
    await updatePlotStatusFn({ data: { id, status } });
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

export async function removePlot(id: string): Promise<boolean> {
  try {
    await deletePlotFn({ data: { id } });
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
