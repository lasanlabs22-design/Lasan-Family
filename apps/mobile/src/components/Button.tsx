import type { ComponentType } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, fonts, radii, touch } from "@/theme";
import { haptic } from "@/lib/haptics";
import { Text } from "./Text";

type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "accent" | "ghost" | "danger" | "success";
  size?: "md" | "lg";
  icon?: IconType;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const palette = {
  primary: { bg: colors.plum900, fg: colors.white, border: colors.plum900 },
  accent: { bg: colors.blush500, fg: colors.white, border: colors.blush500 },
  success: { bg: colors.sage600, fg: colors.white, border: colors.sage600 },
  secondary: { bg: colors.white, fg: colors.plum900, border: colors.blush100 },
  ghost: { bg: "transparent", fg: colors.plum700, border: "transparent" },
  danger: { bg: colors.white, fg: colors.blush600, border: colors.blush300 },
};

export function Button({ label, onPress, variant = "primary", size = "md", icon: Icon, loading, disabled, style, accessibilityHint }: Props) {
  const p = palette[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        haptic.press();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        { minHeight: size === "lg" ? touch + 8 : touch, backgroundColor: p.bg, borderColor: p.border },
        inactive && { opacity: 0.5 },
        pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {Icon ? <Icon size={20} color={p.fg} strokeWidth={2.2} /> : null}
          <Text style={[styles.label, { color: p.fg, fontSize: size === "lg" ? 17 : 16 }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { fontFamily: fonts.semibold },
});
