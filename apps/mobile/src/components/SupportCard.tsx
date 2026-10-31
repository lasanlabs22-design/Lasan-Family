import { Linking, Pressable, View } from "react-native";
import { Globe, Mail, PhoneCall } from "lucide-react-native";
import { BRAND } from "@lasan/shared";
import { colors, space, touch } from "@/theme";
import { haptic } from "@/lib/haptics";
import { Card } from "./Card";
import { Text } from "./Text";

const ITEMS = [
  { Icon: PhoneCall, label: "Call the care team", value: BRAND.supportPhone, href: BRAND.supportPhoneHref },
  { Icon: Mail, label: "Email us", value: BRAND.supportEmail, href: `mailto:${BRAND.supportEmail}` },
  { Icon: Globe, label: "Website", value: BRAND.website.replace("https://", ""), href: BRAND.website },
];

export function SupportCard() {
  return (
    <Card style={{ paddingVertical: space.xs }}>
      {ITEMS.map(({ Icon, label, value, href }, i) => (
        <Pressable
          key={label}
          accessibilityRole="link"
          accessibilityLabel={`${label}: ${value}`}
          onPress={() => {
            haptic.tap();
            Linking.openURL(href).catch(() => {});
          }}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: space.sm,
            minHeight: touch + 8,
            borderBottomWidth: i < ITEMS.length - 1 ? 1 : 0,
            borderBottomColor: colors.blush50,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.blush50, alignItems: "center", justifyContent: "center" }}>
            <Icon size={18} color={colors.blush600} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{label}</Text>
            <Text variant="caption">{value}</Text>
          </View>
        </Pressable>
      ))}
    </Card>
  );
}
