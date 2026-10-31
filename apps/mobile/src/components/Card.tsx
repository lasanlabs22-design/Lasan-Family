import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radii, ring, shadow, space } from "@/theme";
import { haptic } from "@/lib/haptics";

type Props = { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; tone?: "white" | "blush" | "sage" | "lilac" | "peach"; accessibilityLabel?: string };

const tones = { white: colors.white, blush: colors.blush50, sage: colors.sage100, lilac: colors.lilac100, peach: colors.peach100 };

export function Card({ children, style, onPress, tone = "white", accessibilityLabel }: Props) {
  const base = [styles.card, { backgroundColor: tones[tone] }, tone === "white" && shadow, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [base, pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, padding: space.lg, ...ring },
});
