import { HealthStatusSchema, type HealthStatus } from "@mespace/core";

const REQUEST_TIMEOUT_MS = 10_000;

export async function fetchHealthStatus(baseUrl: string): Promise<HealthStatus> {
  const response = await fetch(`${baseUrl}/api/health`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Health check request failed with status ${response.status}`);
  }

  const body = await response.json();
  return HealthStatusSchema.parse(body);
}
