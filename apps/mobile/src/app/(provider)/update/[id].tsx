import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Send, StickyNote, UtensilsCrossed } from "lucide-react-native";
import { Image } from "expo-image";
import { BackButton, Button, Chip, Field, Notice, Screen, Text } from "@/components";
import { api, errorMessage } from "@/lib/api";
import { haptic } from "@/lib/haptics";
import { keys, type ProviderJob } from "@/lib/queries";
import { colors, radii, space } from "@/theme";

type Kind = "task" | "meal" | "note";

const KINDS: { id: Kind; label: string; Icon: typeof CheckCircle2 }[] = [
  { id: "task", label: "Chore done", Icon: CheckCircle2 },
  { id: "meal", label: "Meal served", Icon: UtensilsCrossed },
  { id: "note", label: "Note", Icon: StickyNote },
];

const SUGGESTIONS: Record<Kind, string[]> = {
  task: ["House swept & mopped", "Vessels washed", "Laundry done", "Clothes ironed", "Bed made", "Kitchen cleaned"],
  meal: ["Breakfast served", "Lunch served", "Dinner cooked", "Evening snack served"],
  note: ["Groceries running low", "Medicines taken on time", "Resting well today"],
};

const isUrl = (s: string) => /^https?:\/\/\S+\.\S+/.test(s);

export default function PostUpdate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const visit = queryClient.getQueryData<ProviderJob[]>(keys.visits("today"))?.find((v) => v.id === id);
  const [kind, setKind] = useState<Kind>("task");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photo = photoUrl.trim();
  const photoOk = !photo || isUrl(photo);

  const post = async () => {
    if (title.trim().length < 2) {
      setError("Add a short title, for example “Lunch served”.");
      haptic.warning();
      return;
    }
    if (!photoOk) {
      setError("The photo link should start with https://");
      haptic.warning();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post(`/provider/visits/${id}/updates`, { kind, title: title.trim(), detail: detail.trim(), photoUrl: kind === "meal" && photo ? photo : null });
      haptic.success();
      await queryClient.invalidateQueries({ queryKey: ["provider", "visits"] });
      router.back();
    } catch (err) {
      haptic.error();
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen edges={["top", "bottom"]}>
        <BackButton />
        <View style={{ gap: 6 }}>
          <Text variant="overline">{visit ? `Visit for ${visit.job.recipientName}` : "Visit update"}</Text>
          <Text variant="title">Tell the family</Text>
          <Text style={{ color: colors.textMuted }}>Updates show up straight away in the family's app.</Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xs }}>
          {KINDS.map((k) => (
            <Chip
              key={k.id}
              label={k.label}
              icon={k.Icon}
              selected={kind === k.id}
              onPress={() => {
                setKind(k.id);
                setTitle("");
              }}
            />
          ))}
        </View>

        <Field label="Title" value={title} onChangeText={setTitle} placeholder={SUGGESTIONS[kind][0]} maxLength={140} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xs }}>
          {SUGGESTIONS[kind].map((s) => (
            <Chip key={s} label={s} selected={title === s} onPress={() => setTitle(s)} />
          ))}
        </View>
        <Field label="Details (optional)" value={detail} onChangeText={setDetail} multiline maxLength={500} placeholder={kind === "meal" ? "e.g. Pappu, rice, curd. Low salt." : "Anything the family should know"} />

        {kind === "meal" ? (
          <>
            <Field
              label="Photo link (optional)"
              hint="Paste a link to the meal photo. Taking photos in the app is coming soon."
              value={photoUrl}
              onChangeText={setPhotoUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="https://"
              error={photoOk ? null : "The link should start with https://"}
            />
            {photo && photoOk ? <Image source={{ uri: photo }} style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radii.md, backgroundColor: colors.blush50 }} contentFit="cover" /> : null}
          </>
        ) : null}

        {error ? <Notice text={error} /> : null}
        <Button label="Post update" size="lg" variant="accent" icon={Send} onPress={post} loading={busy} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
