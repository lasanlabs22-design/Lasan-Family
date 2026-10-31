import { StyleSheet, View } from "react-native";
import { AlertCircle, CheckCircle2, Info } from "lucide-react-native";
import { colors, radii, space } from "@/theme";
import { Text } from "./Text";

/** Inline message for form errors and confirmations. */
export function Notice({ tone = "error", text }: { tone?: "error" | "success" | "info"; text: string }) {
  const c =
    tone === "success"
      ? { bg: colors.sage100, fg: "#3f5a39", Icon: CheckCircle2 }
      : tone === "info"
        ? { bg: colors.lilac100, fg: colors.plum700, Icon: Info }
        : { bg: colors.blush50, fg: colors.blush600, Icon: AlertCircle };
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]} accessibilityRole={tone === "error" ? "alert" : undefined} accessibilityLiveRegion="polite">
      <c.Icon size={20} color={c.fg} />
      <Text style={{ flex: 1, color: c.fg, fontSize: 15, lineHeight: 22 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", gap: space.sm, alignItems: "flex-start", padding: space.md, borderRadius: radii.md },
});
