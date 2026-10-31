import { View } from "react-native";
import { router } from "expo-router";
import { CalendarPlus, ChevronRight, MapPin } from "lucide-react-native";
import { formatINR, type BookingDTO } from "@lasan/shared";
import { Avatar, Card, EmptyState, ErrorState, Screen, Section, SkeletonCard, StatusPill, Text } from "@/components";
import { errorMessage } from "@/lib/api";
import { bookingTitle, dayLabelInline } from "@/lib/format";
import { useBookings, usePullToRefresh } from "@/lib/queries";
import { colors, space } from "@/theme";

export default function Bookings() {
  const q = useBookings();
  const { refreshing, onRefresh } = usePullToRefresh(q.refetch);
  const all = q.data ?? [];
  const current = all.filter((b) => b.status === "requested" || b.status === "confirmed" || b.status === "active");
  const past = all.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <Screen title="Bookings" subtitle="Every booking, its helper and its visits." refreshing={refreshing} onRefresh={onRefresh}>
      {q.isPending ? (
        <>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </>
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : !all.length ? (
        <EmptyState icon={CalendarPlus} title="No bookings yet" text="When you book a maid or home cook, it shows up here." action={{ label: "Book help at home", onPress: () => router.push("/book") }} />
      ) : (
        <>
          {current.length ? (
            <Section title="Current">
              {current.map((b) => (
                <BookingRow key={b.id} b={b} />
              ))}
            </Section>
          ) : null}
          {past.length ? (
            <Section title="Past">
              {past.map((b) => (
                <BookingRow key={b.id} b={b} />
              ))}
            </Section>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function BookingRow({ b }: { b: BookingDTO }) {
  return (
    <Card onPress={() => router.push(`/booking/${b.id}`)} accessibilityLabel={`${bookingTitle(b)}, ${b.status}`}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
        <View style={{ flex: 1, gap: 6 }}>
          <StatusPill booking={b.status} />
          <Text variant="subheading">{bookingTitle(b)}</Text>
          <Text variant="caption">
            For {b.recipientName} · from {dayLabelInline(b.startDate)}
          </Text>
        </View>
        <ChevronRight size={22} color={colors.plum300} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.md, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.blush50 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
          {b.provider ? <Avatar name={b.provider.name} photo={b.provider.photo} size={32} /> : <MapPin size={16} color={colors.plum500} />}
          <Text variant="caption" numberOfLines={1} style={{ flex: 1 }}>
            {b.provider ? b.provider.name : `${b.locality}, ${b.cityName}`}
          </Text>
        </View>
        <Text variant="bodyStrong">{formatINR(b.total)}</Text>
      </View>
    </Card>
  );
}
