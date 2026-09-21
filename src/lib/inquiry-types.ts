import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2, "Please provide your full name").max(80),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please provide a valid 10-digit Indian mobile number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  plotPreference: z.string().default("1000 sq ft"),
  visitDate: z.string().optional(),
  slot: z.string().default("Morning (10:00 AM)"),
  cabPickup: z.boolean().default(false),
  pickupLocation: z.string().default("On Site"),
  message: z.string().max(500).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type Inquiry = InquiryInput & {
  id: string;
  status: "New" | "Contacted" | "Visit Scheduled" | "Site Visit Done" | "Booked";
  createdAt: string;
};
