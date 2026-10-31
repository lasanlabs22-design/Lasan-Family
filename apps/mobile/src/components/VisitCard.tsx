import { View } from "react-native";
import { Clock } from "lucide-react-native";
import type { VisitDTO } from "@lasan/shared";
import { colors, space } from "@/theme";
import { dayLabel, timeOf } from "@/lib/format";
import { Avatar } from "./Avatar";
import { Card } from "./Card";
import { StatusPill } from "./StatusPill";
import { Text } from "./Text";
import { VisitTimeline } from "./VisitTimeline";

/** A visit as the family sees it: who is coming, live status and, optionally, the timeline. */
export function VisitCard({ visit, showTimeline, onPress }: { visit: VisitDTO; showTimeline?: boolean; onPress?: () => void }) {
  const helper = visit.provider;
  const live =
    visit.status === "in_progress" && visit.checkInAt
      ? `Checked in at ${timeOf(visit.checkInAt)}`
      : visit.status === "done" && visit.checkOutAt
        ? `Finished at ${timeOf(visit.checkOutAt)}`
        : visit.slot;
  return (
    <Card onPress={onPress} accessibilityLabel={`${helper?.name ?? "Helper"} visit, ${dayLabel(visit.date)}`}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
        <Avatar name={helper?.name ?? "Lasan helper"} photo={helper?.photo} size={56} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="subheading">{helper?.name ?? "Helper being assigned"}</Text>
          <Text variant="caption">{helper?.title ?? "We'll confirm your helper soon"}</Text>
        </View>
        <StatusPill visit={visit.status} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: space.md }}>
        <Clock size={16} color={colors.plum500} />
        <Text variant="caption" style={{ color: colors.plum700 }}>
          {showTimeline ? live : `${dayLabel(visit.date)} · ${visit.slot}`}
        </Text>
      </View>
      {showTimeline ? (
        <View style={{ marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.blush50 }}>
          <VisitTimeline updates={visit.updates} />
        </View>
      ) : null}
    </Card>
  );
}
