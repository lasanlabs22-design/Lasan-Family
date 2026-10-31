import { Stack } from "expo-router";
import { colors } from "@/theme";

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="booking/[id]" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
