import { useState } from "react";
import { Alert, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarClock, XCircle } from "lucide-react-native";
import { FREQUENCIES, formatINR } from "@lasan/shared";
import { Avatar, BackButton, Button, Card, EmptyState, ErrorState, Notice, Screen, Section, SkeletonCard, StatusPill, Text, VisitTimeline } from "@/components";
import { api, errorMessage } from "@/lib/api";
import { bookingTitle, dayLabelInline, formatPhone, shortDate, todayIST } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { keys, useBooking, usePullToRefresh } from "@/lib/queries";
import { colors, space } from "@/theme";

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useBooking(id);
  const queryClient = useQueryClient();
  const { refreshing, onRefresh } = usePullToRefresh(q.refetch);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const b = q.data?.booking;
  const visits = q.data?.visits ?? [];
  const today = todayIST();
  const shown = visits;
  const canCancel = b && (b.status === "requested" || b.status === "confirmed" || b.status === "active");

  const cancel = () => {
    haptic.warning();
    Alert.alert("Cancel this booking?", "Upcoming visits will be cancelled. Your coordinator will be told straight away.", [
      { text: "Keep booking", style: "cancel" },
      {
        text: "Cancel booking",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          setError(null);
          try {
            await api.post(`/me/bookings/${id}/cancel`);
            haptic.success();
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: keys.booking(id) }),
              queryClient.invalidateQueries({ queryKey: keys.bookings }),
              queryClient.invalidateQueries({ queryKey: keys.home }),
            ]);
          } catch (err) {
            haptic.error();
            setError(errorMessage(err));
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen edges={["top", "bottom"]} refreshing={refreshing} onRefresh={onRefresh}>
      <BackButton />
      {q.isPending ? (
        <SkeletonCard lines={5} />
      ) : q.isError || !b ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : (
        <>
          <View style={{ gap: 6 }}>
            <Text variant="overline">Booking {b.code}</Text>
            <Text variant="title">{bookingTitle(b)}</Text>
            <StatusPill booking={b.status} />
          </View>

          <Card>
            {b.provider ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.sm }}>
                <Avatar name={b.provider.name} photo={b.provider.photo} size={52} />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{b.provider.name}</Text>
                  <Text variant="caption">{b.provider.title}</Text>
                </View>
              </View>
            ) : (
              <Notice tone="info" text="Your coordinator is matching a verified helper and will call to confirm." />
            )}
            <Row label="Schedule" value={`${FREQUENCIES.find((f) => f.id === b.frequency)?.label ?? b.frequency} · from ${dayLabelInline(b.startDate)} · ${b.slot}`} />
            <Row label="For" value={`${b.recipientName} · ${formatPhone(b.phone)}`} />
            <Row label="Address" value={`${b.address}, ${b.locality}, ${b.cityName}`} />
            {b.food || b.diets.length ? <Row label="Food" value={[b.food, ...b.diets].filter(Boolean).join(", ")} /> : null}
            {b.notes ? <Row label="Notes" value={b.notes} /> : null}
            <Row label="Estimated total" value={formatINR(b.total)} last />
          </Card>

          <Section title="Visits">
            {shown.length ? (
              shown.map((v) => (
                <Card key={v.id}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.sm }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyStrong">{v.date === today ? "Today" : shortDate(v.date)}</Text>
                      <Text variant="caption">{v.slot}</Text>
                    </View>
                    <StatusPill visit={v.status} />
                  </View>
                  {v.updates.length ? (
                    <View style={{ marginTop: space.md }}>
                      <VisitTimeline updates={v.updates} />
                    </View>
                  ) : null}
                </Card>
              ))
            ) : (
              <EmptyState icon={CalendarClock} tone="lilac" title="Visits appear once confirmed" text="As soon as a helper is assigned, each visit is listed here with live updates." />
            )}
          </Section>

          {error ? <Notice text={error} /> : null}
          {canCancel ? <Button label="Cancel booking" variant="danger" icon={XCircle} onPress={cancel} loading={cancelling} /> : null}
        </>
      )}
    </Screen>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{ paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.blush50, gap: 2 }}>
      <Text variant="caption">{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}
