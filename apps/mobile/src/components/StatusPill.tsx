import { StyleSheet, View } from "react-native";
import { BOOKING_STATUS_LABEL, type BookingStatus, type VisitStatus } from "@lasan/shared";
import { colors, fonts, radii } from "@/theme";
import { Text } from "./Text";

const BOOKING: Record<BookingStatus, { bg: string; fg: string; dot: string }> = {
  requested: { bg: colors.peach100, fg: "#8a5a1f", dot: colors.gold400 },
  confirmed: { bg: colors.lilac100, fg: colors.plum700, dot: colors.plum500 },
  active: { bg: colors.sage100, fg: "#3f5a39", dot: colors.sage600 },
  completed: { bg: "#f1e8f0", fg: colors.plum700, dot: colors.plum300 },
  cancelled: { bg: colors.blush100, fg: colors.blush600, dot: colors.blush500 },
};

const VISIT: Record<VisitStatus, { label: string; tone: BookingStatus }> = {
  scheduled: { label: "Scheduled", tone: "confirmed" },
  in_progress: { label: "Checked in", tone: "active" },
  done: { label: "Done", tone: "completed" },
  missed: { label: "Missed", tone: "cancelled" },
  cancelled: { label: "Cancelled", tone: "cancelled" },
};

export function StatusPill({ booking, visit }: { booking?: BookingStatus; visit?: VisitStatus }) {
  const tone = booking ?? (visit ? VISIT[visit].tone : "requested");
  const label = booking ? BOOKING_STATUS_LABEL[booking] : visit ? VISIT[visit].label : "";
  const c = BOOKING[tone];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]} accessibilityLabel={`Status: ${label}`}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.label, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: radii.pill },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
});
