import { Platform, StyleSheet, Text } from "react-native";
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
    borderColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    fontFamily: "Inter_400Regular",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
