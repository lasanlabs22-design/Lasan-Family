import { Linking, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { CalendarHeart, LifeBuoy, PhoneCall } from "lucide-react-native";
import { BRAND } from "@lasan/shared";
import { EmptyState, ErrorState, Screen, Section, SkeletonCard, Text, VisitCard } from "@/components";
import { errorMessage } from "@/lib/api";
import { firstName, greeting } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { useCustomerHome, useMe, usePullToRefresh } from "@/lib/queries";
import { useSession } from "@/lib/session";
import { colors, radii, space } from "@/theme";

const callSupport = () => {
  haptic.press();
  Linking.openURL(BRAND.supportPhoneHref).catch(() => {});
};

export default function CustomerHome() {
  const { user } = useSession();
  const me = useMe();
  const home = useCustomerHome();
  const { refreshing, onRefresh } = usePullToRefresh(() => Promise.all([home.refetch(), me.refetch()]));
  const name = firstName(me.data?.name || user?.name);
  const today = home.data?.today ?? [];
  const upcoming = home.data?.upcoming ?? [];

  return (
    <Screen overline={greeting()} title={name ? `Hello, ${name}` : "Hello"} subtitle="Here's what's happening at home today." refreshing={refreshing} onRefresh={onRefresh}>
      <View style={styles.actions}>
        <QuickAction icon={PhoneCall} label="Call helper" hint="Connects through the Lasan care team" onPress={callSupport} />
        <QuickAction icon={LifeBuoy} label="Help / SOS" hint="Call the Lasan care team now" onPress={callSupport} tone="alert" />
      </View>

      <Section title="Today">
        {home.isPending ? (
          <SkeletonCard lines={4} />
        ) : home.isError ? (
          <ErrorState message={errorMessage(home.error)} onRetry={() => home.refetch()} />
        ) : today.length ? (
          today.map((v) => <VisitCard key={v.id} visit={v} showTimeline onPress={() => router.push(`/booking/${v.bookingId}`)} />)
        ) : (
          <EmptyState
            icon={CalendarHeart}
            title="No visits today"
            text={upcoming.length ? "Your next visit is listed below." : "Book a verified maid or home cook and follow every visit here."}
            action={upcoming.length ? undefined : { label: "Book help at home", onPress: () => router.push("/book") }}
          />
        )}
      </Section>

      {upcoming.length ? (
        <Section title="Coming up">
          {upcoming.map((v) => (
            <VisitCard key={v.id} visit={v} onPress={() => router.push(`/booking/${v.bookingId}`)} />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

function QuickAction({ icon: Icon, label, hint, onPress, tone }: { icon: typeof PhoneCall; label: string; hint: string; onPress: () => void; tone?: "alert" }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      style={({ pressed }) => [styles.action, tone === "alert" && { backgroundColor: colors.blush50, borderColor: colors.blush100 }, pressed && { opacity: 0.85 }]}
    >
      <Icon size={22} color={tone === "alert" ? colors.blush600 : colors.plum700} />
      <Text variant="label" style={tone === "alert" ? { color: colors.blush600 } : undefined}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: space.sm },
  action: { flex: 1, minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: radii.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ring },
});
