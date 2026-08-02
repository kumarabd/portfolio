import { HealthStatusSchema, type HealthStatus } from "@mespace/core";

export async function fetchHealthStatus(baseUrl: string): Promise<HealthStatus> {
  const response = await fetch(`${baseUrl}/api/health`);

  if (!response.ok) {
    throw new Error(`Health check request failed with status ${response.status}`);
  }

  const body = await response.json();
  return HealthStatusSchema.parse(body);
}
