import { z } from "zod";

export const HealthStatusSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  timestamp: z.string().datetime(),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
