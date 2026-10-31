import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { colors, fonts } from "@/theme";
import { photoUri } from "@/lib/format";
import { Text } from "./Text";

export function Avatar({ name, photo, size = 56 }: { name: string; photo?: string | null; size?: number }) {
  const uri = photoUri(photo, size * 3);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]} accessibilityLabel={name}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" transition={250} />
      ) : (
        <Text style={{ fontFamily: fonts.display, fontSize: size * 0.38, color: colors.plum700 }}>{initials || "L"}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.blush100, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 2, borderColor: colors.white },
});
