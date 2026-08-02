import { Text } from "react-native";
import type { HealthStatus } from "@mespace/core";

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  return <Text testID="health-status-badge">API status: {status.status}</Text>;
}
