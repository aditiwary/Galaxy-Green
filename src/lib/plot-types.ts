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
