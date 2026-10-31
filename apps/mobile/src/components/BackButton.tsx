import { Pressable } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { colors, touch } from "@/theme";
import { haptic } from "@/lib/haptics";

export function BackButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      onPress={() => {
        haptic.tap();
        if (onPress) onPress();
        else if (router.canGoBack()) router.back();
        else router.replace("/");
      }}
      style={({ pressed }) => ({
        width: touch - 4,
        height: touch - 4,
        borderRadius: touch,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.ring,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <ChevronLeft size={24} color={colors.plum900} />
    </Pressable>
  );
}
