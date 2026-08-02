import { useEffect, useState } from "react";
import { View } from "react-native";
import type { HealthStatus } from "@mespace/core";
import { fetchHealthStatus } from "@mespace/api-client";
import { HealthStatusBadge } from "../components/health-status-badge";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export default function HomeScreen() {
  const [status, setStatus] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetchHealthStatus(API_BASE_URL)
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  return <View>{status ? <HealthStatusBadge status={status} /> : null}</View>;
}
