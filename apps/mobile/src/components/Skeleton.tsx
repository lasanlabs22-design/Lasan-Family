import { useEffect, useRef } from "react";
import { Animated, Easing, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import { colors, radii, space } from "@/theme";

/** A calm pulsing placeholder block. */
export function Skeleton({ width = "100%", height = 16, radius = 10, style }: { width?: DimensionValue; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: colors.blush100, opacity: pulse }, style]} />;
}

/** A card-shaped skeleton used while lists load. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <View style={{ backgroundColor: colors.white, borderRadius: radii.lg, padding: space.lg, gap: space.sm, borderWidth: 1, borderColor: colors.ring }} accessibilityLabel="Loading">
      <View style={{ flexDirection: "row", gap: space.sm, alignItems: "center" }}>
        <Skeleton width={52} height={52} radius={26} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="60%" height={18} />
          <Skeleton width="40%" height={14} />
        </View>
      </View>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "70%" : "100%"} height={14} />
      ))}
    </View>
  );
}
