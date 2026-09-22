import { z } from "zod";

export const plotSchema = z.object({
  number: z.string().min(1, "Plot number required"),
  sizeSqFt: z.number().min(100, "Minimum 100 sq ft"),
  dimensions: z.string().min(3, "Dimensions required (e.g. 25 × 40 ft)"),
  facing: z.enum(["East", "North", "Park Facing", "Boulevard Corner", "West", "South"]),
  roadWidth: z.string().default("30 ft Internal"),
  ratePerSqFt: z.number().min(500, "Rate per sq ft required"),
  status: z.enum(["Available", "Fast Selling", "Reserved", "Sold Out"]),
  feature: z.string().default("Freehold residential plot with clear title"),
});

export type PlotInput = z.infer<typeof plotSchema>;

export type Plot = PlotInput & {
  id: string;
};

export const DEFAULT_PLOTS: Plot[] = [
  {
    id: "plot-a1",
    number: "A-101",
    sizeSqFt: 1000,
    dimensions: "25 × 40 ft",
    facing: "East",
    roadWidth: "30 ft Internal",
    ratePerSqFt: 1199,
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
    ratePerSqFt: 1199,
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
    ratePerSqFt: 1199,
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
    ratePerSqFt: 1199,
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
    ratePerSqFt: 1199,
    status: "Available",
    feature: "Premium estate plot overlooking central landscaped green park & avenue.",
  },
  {
    id: "plot-c2",
    number: "C-308",
    sizeSqFt: 2000,
    dimensions: "40 × 50 ft",
    facing: "Boulevard Corner",
    roadWidth: "40 ft × 30 ft Dual Road",
    ratePerSqFt: 1299,
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
    ratePerSqFt: 1299,
    status: "Reserved",
    feature: "Ultra-luxury mansion plot with expansive private lawn and garden clearance.",
  },
  {
    id: "plot-d2",
    number: "D-405",
    sizeSqFt: 1000,
    dimensions: "25 × 40 ft",
    facing: "North",
    roadWidth: "30 ft Internal",
    ratePerSqFt: 1199,
    status: "Available",
    feature: "Prime location near security entrance and visitor parking.",
  },
];
