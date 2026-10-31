import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { CheckCircle2, DoorOpen, LogOut, StickyNote, UtensilsCrossed } from "lucide-react-native";
import type { VisitUpdateDTO } from "@lasan/shared";
import { colors, radii, space } from "@/theme";
import { photoUri, timeOf } from "@/lib/format";
import { Text } from "./Text";

const ICONS = { check_in: DoorOpen, check_out: LogOut, task: CheckCircle2, meal: UtensilsCrossed, note: StickyNote } as const;
const TINTS = { check_in: colors.sage100, check_out: colors.lilac100, task: colors.sage100, meal: colors.peach100, note: colors.blush50 } as const;
const FG = { check_in: colors.sage600, check_out: colors.plum500, task: colors.sage600, meal: "#b06a2c", note: colors.blush500 } as const;

/** The live story of a visit: check-in, chores, meals (with photos), notes, check-out. */
export function VisitTimeline({ updates }: { updates: VisitUpdateDTO[] }) {
  if (!updates.length) return <Text style={{ color: colors.textMuted }}>Updates from the visit will appear here as they happen.</Text>;
  const sorted = [...updates].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <View>
      {sorted.map((u, i) => {
        const Icon = ICONS[u.kind] ?? StickyNote;
        const last = i === sorted.length - 1;
        const uri = photoUri(u.photoUrl, 900);
        return (
          <View key={u.id} style={styles.row} accessible accessibilityLabel={`${timeOf(u.at)}. ${u.title}. ${u.detail}`}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: TINTS[u.kind] }]}>
                <Icon size={16} color={FG[u.kind]} strokeWidth={2.2} />
              </View>
              {!last ? <View style={styles.line} /> : null}
            </View>
            <View style={[styles.body, !last && { paddingBottom: space.md }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: space.xs }}>
                <Text variant="bodyStrong" style={{ flex: 1 }}>
                  {u.title}
                </Text>
                <Text variant="caption">{timeOf(u.at)}</Text>
              </View>
              {u.detail ? <Text style={{ color: colors.textMuted }}>{u.detail}</Text> : null}
              {uri ? <Image source={{ uri }} style={styles.photo} contentFit="cover" transition={300} accessibilityLabel={`Photo: ${u.title}`} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: space.sm },
  rail: { alignItems: "center", width: 32 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  line: { flex: 1, width: 2, backgroundColor: colors.blush100, marginVertical: 4, borderRadius: 1 },
  body: { flex: 1, gap: 4, paddingTop: 4 },
  photo: { width: "100%", aspectRatio: 4 / 3, borderRadius: radii.md, marginTop: space.xs, backgroundColor: colors.blush50 },
});
