import { z } from "zod";

export const reportSchema = z.object({
  categories: z.array(z.string()).min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationLabel: z.string().min(2),
  city: z.string().optional(),
  municipality: z.string().optional(),
  occurredAt: z.string().datetime(),
  approximateTime: z.enum(["UNKNOWN", "MORNING", "AFTERNOON", "EVENING", "NIGHT"]),
  exactTimeUnknown: z.boolean().default(false),
  description: z.string().min(10).max(2000),
  severity: z.number().int().min(1).max(5),
});

export const moderationSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "HIDE", "REMOVE"]),
  note: z.string().max(1000).optional(),
});
