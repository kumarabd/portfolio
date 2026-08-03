import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import type { HealthStatus } from "@mespace/core";
import { fetchHealthStatus } from "@mespace/api-client";
import { HealthStatusBadge } from "@/components/health-status-badge";
import { theme } from "@/theme";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

type HealthState = "loading" | "error" | HealthStatus;

export default function HomeScreen() {
  const [health, setHealth] = useState<HealthState>("loading");
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });

  useEffect(() => {
    fetchHealthStatus(API_BASE_URL)
      .then(setHealth)
      .catch(() => setHealth("error"));
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>MeSpace</Text>
      {health === "loading" ? <Text style={styles.status}>Loading...</Text> : null}
      {health === "error" ? (
        <Text style={styles.error}>Unable to load status</Text>
      ) : null}
      {health !== "loading" && health !== "error" ? (
        <HealthStatusBadge status={health} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.lg,
    padding: theme.spacing.xxl,
  },
  heading: {
    fontSize: 48,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: theme.colors.foreground,
  },
  status: {
    fontFamily: "Inter_400Regular",
    color: theme.colors.secondary,
  },
  error: {
    fontFamily: "Inter_400Regular",
    color: theme.colors.destructive,
  },
});
