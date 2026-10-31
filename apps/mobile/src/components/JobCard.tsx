import { useState, type ReactNode } from "react";
import { Alert, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { DoorOpen, LogOut, MapPin, MessageSquarePlus, Phone, Salad, StickyNote } from "lucide-react-native";
import { api, errorMessage } from "@/lib/api";
import { formatPhone, timeOf } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import type { ProviderJob } from "@/lib/queries";
import { colors, radii, space, touch } from "@/theme";
import { Button } from "./Button";
import { Card } from "./Card";
import { Notice } from "./Notice";
import { StatusPill } from "./StatusPill";
import { Text } from "./Text";
import { VisitTimeline } from "./VisitTimeline";

export function openMaps(address: string) {
  const q = encodeURIComponent(address);
  const url = Platform.OS === "ios" ? `maps:0,0?q=${q}` : `geo:0,0?q=${q}`;
  Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {}));
}

export function callNumber(phone: string) {
  Linking.openURL(`tel:${phone.replace(/\s/g, "")}`).catch(() => {});
}

/** A job as the helper sees it. With `actions`, shows check-in / updates / check-out. */
export function JobCard({ visit, actions }: { visit: ProviderJob; actions?: boolean }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<"in" | "out" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { job } = visit;

  const run = async (kind: "in" | "out") => {
    setBusy(kind);
    setError(null);
    try {
      await api.post(`/provider/visits/${visit.id}/${kind === "in" ? "check-in" : "check-out"}`);
      haptic.success();
      await queryClient.invalidateQueries({ queryKey: ["provider"] });
    } catch (err) {
      haptic.error();
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const checkOut = () => {
    haptic.warning();
    Alert.alert("Finish this visit?", `Check out from ${job.recipientName}'s home. The family is told you've left.`, [
      { text: "Not yet", style: "cancel" },
      { text: "Check out", onPress: () => run("out") },
    ]);
  };

  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space.sm }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="heading">{job.recipientName}</Text>
          <Text variant="caption">
            {visit.slot}
            {visit.checkInAt ? ` · in at ${timeOf(visit.checkInAt)}` : ""}
            {visit.checkOutAt ? ` · out at ${timeOf(visit.checkOutAt)}` : ""}
          </Text>
        </View>
        <StatusPill visit={visit.status} />
      </View>

      <View style={{ gap: space.xs, marginTop: space.md }}>
        <InfoRow icon={MapPin} text={job.address} action="Open in maps" onPress={() => openMaps(job.address)} />
        <InfoRow icon={Phone} text={formatPhone(job.phone)} action={`Call ${job.recipientName}`} onPress={() => callNumber(job.phone)} />
      </View>

      <View style={styles.tags}>
        {job.services.map((s) => (
          <View key={s} style={styles.tag}>
            <Text style={styles.tagText}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
          </View>
        ))}
      </View>

      {job.food || job.diets.length ? (
        <Line icon={<Salad size={18} color={colors.sage600} />}>
          <Text>{[job.food, ...job.diets].filter(Boolean).join(" · ")}</Text>
        </Line>
      ) : null}
      {job.notes ? (
        <Line icon={<StickyNote size={18} color={colors.blush500} />}>
          <Text style={{ color: colors.textMuted }}>{job.notes}</Text>
        </Line>
      ) : null}

      {actions ? (
        <View style={{ gap: space.sm, marginTop: space.md }}>
          {error ? <Notice text={error} /> : null}
          {visit.status === "scheduled" ? <Button label="Check in" size="lg" variant="success" icon={DoorOpen} onPress={() => run("in")} loading={busy === "in"} /> : null}
          {visit.status === "in_progress" ? (
            <>
              <Button label="Add an update" size="lg" variant="accent" icon={MessageSquarePlus} onPress={() => router.push(`/update/${visit.id}`)} />
              <Button label="Check out" size="lg" icon={LogOut} onPress={checkOut} loading={busy === "out"} />
            </>
          ) : null}
          {visit.status === "done" ? <Notice tone="success" text="Visit complete. Thank you!" /> : null}
        </View>
      ) : null}

      {actions && visit.updates.length ? (
        <View style={{ marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.blush50, gap: space.sm }}>
          <Text variant="label">What the family sees</Text>
          <VisitTimeline updates={visit.updates} />
        </View>
      ) : null}
    </Card>
  );
}

function InfoRow({ icon: Icon, text, action, onPress }: { icon: typeof MapPin; text: string; action: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${text}. ${action}`}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.info, pressed && { opacity: 0.8 }]}
    >
      <Icon size={20} color={colors.plum700} />
      <Text style={{ flex: 1 }}>{text}</Text>
      <Text style={{ color: colors.blush600, fontSize: 14 }}>{action.startsWith("Call") ? "Call" : "Map"}</Text>
    </Pressable>
  );
}

function Line({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: space.xs, alignItems: "flex-start", marginTop: space.sm }}>
      <View style={{ paddingTop: 3 }}>{icon}</View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  info: { flexDirection: "row", alignItems: "center", gap: space.sm, minHeight: touch, paddingHorizontal: space.sm, borderRadius: radii.sm, backgroundColor: colors.cream },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: space.sm },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radii.pill, backgroundColor: colors.lilac100 },
  tagText: { fontSize: 14, lineHeight: 20, color: colors.plum700, fontFamily: "PlusJakartaSans_600SemiBold" },
});
