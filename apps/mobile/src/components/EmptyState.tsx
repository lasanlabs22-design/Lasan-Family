import type { ComponentType } from "react";
import { StyleSheet, View } from "react-native";
import { colors, radii, space } from "@/theme";
import { Button } from "./Button";
import { Text } from "./Text";

type Props = {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  text?: string;
  action?: { label: string; onPress: () => void };
  tone?: "blush" | "sage" | "lilac";
};

export function EmptyState({ icon: Icon, title, text, action, tone = "blush" }: Props) {
  const bg = tone === "sage" ? colors.sage100 : tone === "lilac" ? colors.lilac100 : colors.blush50;
  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <View style={styles.icon}>
        <Icon size={26} color={colors.blush500} strokeWidth={1.8} />
      </View>
      <Text variant="heading" style={{ textAlign: "center" }}>
        {title}
      </Text>
      {text ? <Text style={{ textAlign: "center", color: colors.textMuted }}>{text}</Text> : null}
      {action ? <Button label={action.label} onPress={action.onPress} style={{ marginTop: space.xs, alignSelf: "stretch" }} /> : null}
    </View>
  );
}

/** Friendly inline error with a retry action. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.wrap, { backgroundColor: colors.blush50 }]} accessibilityRole="alert">
      <Text variant="subheading" style={{ textAlign: "center" }}>
        That didn't load
      </Text>
      <Text style={{ textAlign: "center", color: colors.textMuted }}>{message}</Text>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} style={{ alignSelf: "stretch", marginTop: space.xs }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radii.lg, padding: space.xl, alignItems: "center", gap: space.xs },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", marginBottom: space.xs },
});
