import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { ArrowRight, HeartHandshake, Home, ShieldCheck } from "lucide-react-native";
import { BRAND, IMG, unsplash } from "@lasan/shared";
import { Logo, Screen, Text } from "@/components";
import { haptic } from "@/lib/haptics";
import { colors, radii, shadow, space } from "@/theme";

const CHOICES = [
  { role: "customer", title: "I need help at home", text: "Book a verified maid or home cook, and follow each visit live.", Icon: Home, tint: colors.blush50 },
  { role: "provider", title: "I work with Lasan Family", text: "See today's homes, check in and out, and track your earnings.", Icon: HeartHandshake, tint: colors.lilac100 },
] as const;

export default function Welcome() {
  return (
    <Screen edges={["top", "bottom"]} contentStyle={{ gap: space.lg }}>
      <Logo size={36} />
      <Image source={{ uri: unsplash(IMG.elderYellow, 900, 700) }} style={styles.hero} contentFit="cover" transition={400} accessibilityLabel="A smiling woman at home" />
      <View style={{ gap: space.xs }}>
        <Text variant="hero">
          Help at home,{"\n"}
          <Text variant="hero" style={{ fontFamily: "Fraunces_500Medium_Italic", color: colors.blush500 }}>
            from women you can trust.
          </Text>
        </Text>
        <Text style={{ color: colors.textMuted }}>{BRAND.tagline} across Andhra Pradesh and Telangana.</Text>
      </View>

      <View style={{ gap: space.sm }}>
        {CHOICES.map(({ role, title, text, Icon, tint }) => (
          <Pressable
            key={role}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityHint={text}
            onPress={() => {
              haptic.press();
              router.push({ pathname: "/phone", params: { role } });
            }}
            style={({ pressed }) => [styles.choice, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
          >
            <View style={[styles.icon, { backgroundColor: tint }]}>
              <Icon size={26} color={colors.plum700} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="subheading">{title}</Text>
              <Text variant="caption">{text}</Text>
            </View>
            <ArrowRight size={22} color={colors.plum500} />
          </Pressable>
        ))}
      </View>

      <View style={styles.trust}>
        <ShieldCheck size={18} color={colors.sage600} />
        <Text variant="caption" style={{ flex: 1 }}>
          Every helper is Aadhaar and police verified before her first visit.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: "100%", aspectRatio: 16 / 11, borderRadius: radii.xl, backgroundColor: colors.blush50 },
  choice: { flexDirection: "row", alignItems: "center", gap: space.md, backgroundColor: colors.white, borderRadius: radii.lg, padding: space.lg, minHeight: 96, borderWidth: 1, borderColor: colors.ring, ...shadow },
  icon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  trust: { flexDirection: "row", alignItems: "center", gap: space.xs, paddingHorizontal: space.xs },
});
