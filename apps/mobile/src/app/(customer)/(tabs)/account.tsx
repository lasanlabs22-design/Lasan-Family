import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Save } from "lucide-react-native";
import { DIETS, FOOD } from "@lasan/shared";
import { Avatar, Button, Card, Chip, ErrorState, Field, Notice, Screen, Section, SkeletonCard, SupportCard, Text } from "@/components";
import { api, errorMessage } from "@/lib/api";
import { formatPhone } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { keys, useCities, useMe, type Me } from "@/lib/queries";
import { useSession } from "@/lib/session";
import { colors, space } from "@/theme";

export default function Account() {
  const me = useMe();
  const { signOut } = useSession();

  const confirmSignOut = () => {
    haptic.warning();
    Alert.alert("Sign out?", "You can sign back in any time with your mobile number.", [
      { text: "Stay signed in", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen title="Account">
        {me.isPending ? (
          <SkeletonCard lines={4} />
        ) : me.isError ? (
          <ErrorState message={errorMessage(me.error)} onRetry={() => me.refetch()} />
        ) : (
          <ProfileForm key={me.data.id} me={me.data} />
        )}
        <Section title="Support">
          <SupportCard />
        </Section>
        <Button label="Sign out" variant="ghost" icon={LogOut} onPress={confirmSignOut} style={{ marginTop: space.sm }} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

function ProfileForm({ me }: { me: Me }) {
  const queryClient = useQueryClient();
  const { updateUser } = useSession();
  const cities = useCities();
  const [name, setName] = useState(me.name);
  const [citySlug, setCitySlug] = useState(me.citySlug ?? "");
  const [locality, setLocality] = useState(me.locality ?? "");
  const [address, setAddress] = useState(me.address ?? "");
  const [food, setFood] = useState<string | null>(me.food);
  const [diets, setDiets] = useState<string[]>(me.diets ?? []);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const live = (cities.data ?? []).filter((c) => c.status === "live");
  const city = live.find((c) => c.slug === citySlug);

  const save = async () => {
    if (name.trim().length < 2) {
      setMsg({ tone: "error", text: "Please enter your name." });
      haptic.warning();
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const updated = await api.patch<Me>("/me/profile", {
        name: name.trim(),
        citySlug: citySlug || undefined,
        locality,
        address: address.trim(),
        food,
        diets,
      });
      queryClient.setQueryData(keys.me, (old: Me | undefined) => ({ ...(old ?? me), ...updated }));
      updateUser({ name: updated.name });
      haptic.success();
      setMsg({ tone: "success", text: "Saved. New bookings will use these details." });
    } catch (err) {
      haptic.error();
      setMsg({ tone: "error", text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card tone="blush">
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <Avatar name={me.name || "You"} size={60} />
          <View style={{ flex: 1 }}>
            <Text variant="heading">{me.name || "Welcome"}</Text>
            <Text variant="caption">{formatPhone(me.phone)}</Text>
          </View>
        </View>
      </Card>

      <Section title="Your details">
        <Field label="Name" value={name} onChangeText={setName} autoComplete="name" placeholder="Your name" />
        <Text variant="label">City</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xs }}>
          {live.map((c) => (
            <Chip
              key={c.slug}
              label={c.name}
              selected={citySlug === c.slug}
              onPress={() => {
                setCitySlug(c.slug);
                if (!c.localities.includes(locality)) setLocality("");
              }}
            />
          ))}
        </View>
        {city ? (
          <>
            <Text variant="label">Locality</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xs }}>
              {city.localities.map((l) => (
                <Chip key={l} label={l} selected={locality === l} onPress={() => setLocality(l)} />
              ))}
            </View>
          </>
        ) : null}
        <Field label="House number and street" value={address} onChangeText={setAddress} autoComplete="street-address" placeholder="e.g. 10-2-30, Main Road" />
        <Text variant="label">Food preference</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xs }}>
          {FOOD.map((f) => (
            <Chip key={f} label={f} selected={food === f} onPress={() => setFood(food === f ? null : f)} />
          ))}
        </View>
        <Text variant="label">Diet needs</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xs }}>
          {DIETS.map((d) => (
            <Chip key={d} label={d} selected={diets.includes(d)} onPress={() => setDiets(diets.includes(d) ? diets.filter((x) => x !== d) : [...diets, d])} />
          ))}
        </View>
        {msg ? <Notice tone={msg.tone} text={msg.text} /> : null}
        <Button label="Save details" icon={Save} onPress={save} loading={saving} />
        <Text variant="caption" style={{ color: colors.textSubtle }}>
          To change your mobile number, call the care team.
        </Text>
      </Section>
    </>
  );
}
