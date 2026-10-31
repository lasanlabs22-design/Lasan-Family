import { View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { colors, fonts } from "@/theme";
import { Text } from "./Text";

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Defs>
        <LinearGradient id="lg-a" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#f0a3b4" />
          <Stop offset="1" stopColor="#d45677" />
        </LinearGradient>
        <LinearGradient id="lg-b" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c9b8f0" />
          <Stop offset="1" stopColor="#7a4377" />
        </LinearGradient>
      </Defs>
      <Path d="M20 35C10 28 4 21.5 4 14.5 4 9.3 8 5.5 12.8 5.5c3.1 0 5.7 1.6 7.2 4.1" fill="url(#lg-a)" />
      <Path d="M20 35c10-7 16-13.5 16-20.5 0-5.2-4-9-8.8-9-3.1 0-5.7 1.6-7.2 4.1" fill="url(#lg-b)" opacity={0.9} />
      <Path d="M13 21.5c2.2 2.6 4.5 3.9 7 3.9s4.8-1.3 7-3.9" stroke="white" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }} accessibilityLabel="Lasan Family" accessibilityRole="image">
      <LogoMark size={size} />
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: size * 0.7, lineHeight: size * 0.85, color: colors.plum900, letterSpacing: -0.4 }}>Lasan</Text>
        <Text style={{ fontFamily: fonts.semibold, fontSize: size * 0.3, letterSpacing: 3, color: colors.blush600 }}>FAMILY</Text>
      </View>
    </View>
  );
}
