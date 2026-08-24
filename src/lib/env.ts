import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16),
  APP_NAME: z.string().default("NachtVeilig"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DEFAULT_COUNTRY: z.string().default("NL"),
  DEFAULT_LANGUAGE: z.string().default("nl"),
  PUBLIC_LOCATION_RADIUS_METERS: z.coerce.number().default(100),
  MIN_REPORTS_FOR_AREA_STATISTICS: z.coerce.number().default(5),
  LIVE_LOCATION_RETENTION_HOURS: z.coerce.number().default(2),
  PRIVATE_EVIDENCE_RETENTION_DAYS: z.coerce.number().default(365),
  ABUSE_IDENTIFIER_RETENTION_DAYS: z.coerce.number().default(30),
  UPLOAD_MAX_MB: z.coerce.number().default(8),
  RATE_LIMIT_REPORTS_PER_HOUR: z.coerce.number().default(5),
  MAP_TILE_URL: z.string().default("https://tile.openstreetmap.org/{z}/{x}/{y}.png"),
  GEOCODING_PROVIDER: z.string().default("nominatim"),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Environment configuration invalid: ${result.error.message}`);
}

export const env = result.data;
