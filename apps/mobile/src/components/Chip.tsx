import type { ComponentType } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { colors, fonts, radii } from "@/theme";
import { haptic } from "@/lib/haptics";
import { Text } from "./Text";

type Props = { label: string; selected?: boolean; onPress?: () => void; icon?: ComponentType<{ size?: number; color?: string }> };

/** Selectable pill used for options (services, diets, dates, slots). */
export function Chip({ label, selected, onPress, icon: Icon }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPress={() => {
        haptic.tap();
        onPress?.();
      }}
      style={({ pressed }) => [styles.chip, selected ? styles.on : styles.off, pressed && { opacity: 0.85 }]}
    >
      {selected ? <Check size={16} color={colors.white} strokeWidth={3} /> : Icon ? <Icon size={16} color={colors.plum700} /> : null}
      <Text style={[styles.label, { color: selected ? colors.white : colors.plum900 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 48, paddingHorizontal: 16, borderRadius: radii.pill, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  on: { backgroundColor: colors.plum900, borderColor: colors.plum900 },
  off: { backgroundColor: colors.white, borderColor: colors.blush100 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
});
