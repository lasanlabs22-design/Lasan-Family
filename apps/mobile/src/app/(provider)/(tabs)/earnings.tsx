import { StyleSheet, View } from "react-native";
import { Wallet } from "lucide-react-native";
import { PROVIDER_SHARE, formatINR } from "@lasan/shared";
import { Card, EmptyState, ErrorState, Screen, Section, Skeleton, Text } from "@/components";
import { errorMessage } from "@/lib/api";
import { shortDate } from "@/lib/format";
import { useEarnings, usePullToRefresh } from "@/lib/queries";
import { colors, fonts, radii, space } from "@/theme";

export default function Earnings() {
  const q = useEarnings();
  const { refreshing, onRefresh } = usePullToRefresh(q.refetch);
  const e = q.data;

  return (
    <Screen title="Earnings" subtitle={`You keep ${Math.round(PROVIDER_SHARE * 100)}% of every completed visit. Payouts are weekly.`} refreshing={refreshing} onRefresh={onRefresh}>
      {q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : (
        <>
          <Card tone="sage" style={{ gap: 4 }}>
            <Text variant="overline" style={{ color: colors.sage600 }}>
              This month
            </Text>
            {e ? <Text style={styles.big}>{formatINR(e.thisMonth)}</Text> : <Skeleton width={160} height={40} />}
            <Text variant="caption">{e ? `${e.visitsThisMonth} ${e.visitsThisMonth === 1 ? "visit" : "visits"} completed` : " "}</Text>
          </Card>
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <Stat label="This week" value={e ? formatINR(e.thisWeek) : null} />
            <Stat label="Visits this month" value={e ? String(e.visitsThisMonth) : null} />
          </View>

          <Section title="Payouts">
            {!e ? (
              <Skeleton height={120} radius={radii.lg} />
            ) : e.payouts.length ? (
              <Card style={{ paddingVertical: space.xs }}>
                {e.payouts.map((p, i) => (
                  <View key={p.date} style={[styles.payout, i < e.payouts.length - 1 && styles.divider]}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyStrong">{shortDate(p.date)}</Text>
                      <Text variant="caption">{p.status === "paid" ? "Paid" : "Scheduled"}</Text>
                    </View>
                    <Text style={[styles.amount, p.status === "scheduled" && { color: colors.plum500 }]}>{formatINR(p.amount)}</Text>
                  </View>
                ))}
              </Card>
            ) : (
              <EmptyState icon={Wallet} tone="sage" title="No payouts yet" text="Complete your first visits and your weekly payout shows here." />
            )}
          </Section>
        </>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <Card style={{ flex: 1, gap: 4 }}>
      <Text variant="caption">{label}</Text>
      {value !== null ? <Text style={styles.mid}>{value}</Text> : <Skeleton width={80} height={28} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  big: { fontFamily: fonts.display, fontSize: 40, lineHeight: 48, color: colors.plum900 },
  mid: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: colors.plum900 },
  payout: { flexDirection: "row", alignItems: "center", paddingVertical: space.sm, minHeight: 60 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.blush50 },
  amount: { fontFamily: fonts.semibold, fontSize: 18, color: colors.sage600 },
});
