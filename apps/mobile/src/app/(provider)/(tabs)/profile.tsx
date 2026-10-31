import type { ReactNode } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { BadgeCheck, Clock, LogOut, ShieldCheck, Star } from "lucide-react-native";
import { formatINR } from "@lasan/shared";
import { Avatar, Button, Card, ErrorState, Screen, Section, SkeletonCard, SupportCard, Text } from "@/components";
import { errorMessage } from "@/lib/api";
import { haptic } from "@/lib/haptics";
import { useProviderMe, usePullToRefresh } from "@/lib/queries";
import { useSession } from "@/lib/session";
import { colors, radii, space } from "@/theme";

export default function Profile() {
  const q = useProviderMe();
  const { signOut } = useSession();
  const { refreshing, onRefresh } = usePullToRefresh(q.refetch);
  const p = q.data;

  const confirmSignOut = () => {
    haptic.warning();
    Alert.alert("Sign out?", "You can sign back in with your registered mobile number.", [
      { text: "Stay signed in", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <Screen title="Profile" refreshing={refreshing} onRefresh={onRefresh}>
      {q.isPending ? (
        <SkeletonCard lines={4} />
      ) : q.isError || !p ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : (
        <>
          <Card tone="blush" style={{ alignItems: "center", gap: space.xs, paddingVertical: space.xl }}>
            <Avatar name={p.name} photo={p.photo} size={96} />
            <Text variant="title" style={{ marginTop: space.xs }}>
              {p.name}
            </Text>
            <Text variant="caption">
              {p.title} · {p.locality}, {p.cityName}
            </Text>
            <View style={{ flexDirection: "row", gap: space.md, marginTop: space.xs }}>
              {p.reviews > 0 ? (
                <Meta icon={<Star size={16} color={colors.gold400} fill={colors.gold400} />} text={`${p.rating.toFixed(1)} (${p.reviews})`} />
              ) : null}
              <Meta icon={<Clock size={16} color={colors.plum500} />} text={`${p.years} ${p.years === 1 ? "year" : "years"}`} />
            </View>
          </Card>

          <Section title="Verification">
            <View style={{ flexDirection: "row", gap: space.sm }}>
              <Badge ok={p.aadhaarVerified} label="Aadhaar" />
              <Badge ok={p.policeVerified} label="Police check" />
            </View>
            {p.status !== "active" ? (
              <Text variant="caption">Your account is {p.status}. Your coordinator will help you finish the remaining steps.</Text>
            ) : null}
          </Section>

          <Section title="Work details">
            <Card style={{ paddingVertical: space.xs }}>
              <Row label="Rate" value={`${formatINR(p.rate)} / ${p.unit}`} />
              <Row label="Languages" value={p.languages.join(", ")} />
              <Row label="Mobile" value="Call your coordinator to change it" last />
            </Card>
          </Section>
        </>
      )}
      <Section title="Need help?">
        <SupportCard />
      </Section>
      <Button label="Sign out" variant="ghost" icon={LogOut} onPress={confirmSignOut} style={{ marginTop: space.sm }} />
    </Screen>
  );
}

function Meta({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {icon}
      <Text variant="label">{text}</Text>
    </View>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  const Icon = ok ? BadgeCheck : ShieldCheck;
  return (
    <View style={[styles.badge, { backgroundColor: ok ? colors.sage100 : colors.peach100 }]} accessibilityLabel={`${label}: ${ok ? "verified" : "pending"}`}>
      <Icon size={22} color={ok ? colors.sage600 : "#b06a2c"} />
      <View>
        <Text variant="label">{label}</Text>
        <Text variant="caption">{ok ? "Verified" : "Pending"}</Text>
      </View>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{ paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.blush50, gap: 2 }}>
      <Text variant="caption">{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flex: 1, flexDirection: "row", alignItems: "center", gap: space.sm, padding: space.md, borderRadius: radii.md },
});
