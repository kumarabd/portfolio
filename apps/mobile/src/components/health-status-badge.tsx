import { StyleSheet, Text } from "react-native";
import type { HealthStatus } from "@mespace/core";
import { theme } from "@/theme";

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  return (
    <Text testID="health-status-badge" style={styles.badge}>
      API status: {status.status}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    fontFamily: "Inter_400Regular",
    overflow: "hidden",
  },
});
