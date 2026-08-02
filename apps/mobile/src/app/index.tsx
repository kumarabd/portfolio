import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import type { HealthStatus } from "@mespace/core";
import { fetchHealthStatus } from "@mespace/api-client";
import { HealthStatusBadge } from "@/components/health-status-badge";
import { theme } from "@/theme";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export default function HomeScreen() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });

  useEffect(() => {
    fetchHealthStatus(API_BASE_URL)
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>MeSpace</Text>
      {status ? <HealthStatusBadge status={status} /> : null}
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
    fontSize: 40,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: theme.colors.foreground,
  },
});
