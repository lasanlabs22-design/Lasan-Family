import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChefHat, CircleCheckBig, HeartHandshake, Sparkles } from "lucide-react-native";
import {
  DIETS,
  FOOD,
  FOR_WHOM,
  FREQUENCIES,
  PLANS,
  SERVICES,
  SLOTS,
  formatINR,
  normalizePhone,
  quote,
  type BookingDTO,
  type Frequency,
  type Need,
  type PlanSlug,
} from "@lasan/shared";
import { BackButton, Button, Card, Chip, ErrorState, Field, Notice, Screen, Skeleton, Text } from "@/components";
import { api, errorMessage } from "@/lib/api";
import { addDaysISO, dayLabel, dayLabelInline, formatPhone, shortDate, todayIST } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { keys, useCities, useMe, useServices } from "@/lib/queries";
import { colors, fonts, radii, shadow, space } from "@/theme";

const NEEDS: { id: Need; title: string; text: string; Icon: typeof Sparkles }[] = [
  { id: "maid", title: "Home help", text: "Cleaning, laundry, vessels", Icon: Sparkles },
  { id: "cook", title: "Home cooking", text: "Fresh meals at home", Icon: ChefHat },
  { id: "both", title: "Both", text: "Maid + cook together", Icon: HeartHandshake },
];
const STEPS = ["Needs", "Schedule", "Details", "Review"] as const;
const UNIT_LABEL: Record<string, string> = { visit: "visit", day: "day", home: "home", occasion: "occasion", month: "month" };

type Food = (typeof FOOD)[number];
type Diet = (typeof DIETS)[number];
type ForWhom = (typeof FOR_WHOM)[number];

export default function Book() {
  const queryClient = useQueryClient();
  const me = useMe();
  const citiesQ = useCities();
  const servicesQ = useServices();

  const [step, setStep] = useState(0);
  const [need, setNeed] = useState<Need>("maid");
  const [picked, setPicked] = useState<string[]>([]);
  const [planSlug, setPlanSlug] = useState<PlanSlug | null>(null);
  const [frequency, setFrequency] = useState<Frequency>("once");
  const dates = useMemo(() => Array.from({ length: 14 }, (_, i) => addDaysISO(todayIST(), i + 1)), []);
  const [date, setDate] = useState(dates[0]);
  const [slot, setSlot] = useState<(typeof SLOTS)[number]>(SLOTS[0]);

  // Details are prefilled from the account once it loads (until the user edits them).
  const [edited, setEdited] = useState<Record<string, string | string[]>>({});
  const profile = me.data;
  const form = {
    citySlug: (edited.citySlug as string) ?? profile?.citySlug ?? "",
    locality: (edited.locality as string) ?? profile?.locality ?? "",
    address: (edited.address as string) ?? profile?.address ?? "",
    forWhom: ((edited.forWhom as string) ?? "Myself") as ForWhom,
    recipientName: (edited.recipientName as string) ?? (profile?.name || ""),
    phone: (edited.phone as string) ?? (profile?.phone?.replace(/^\+91/, "") ?? ""),
    food: ((edited.food as string) ?? profile?.food ?? FOOD[0]) as Food,
    diets: ((edited.diets as string[]) ?? profile?.diets ?? []) as Diet[],
    notes: (edited.notes as string) ?? "",
  };
  const set = (k: keyof typeof form, v: string | string[]) => setEdited((e) => ({ ...e, [k]: v }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDTO | null>(null);

  // Live prices come from the API (admins can change them); the shared catalog is the fallback.
  const catalog = servicesQ.data?.filter((s) => s.active) ?? SERVICES.map((s) => ({ ...s, active: true }));
  const options = need === "both" ? catalog : catalog.filter((s) => s.category === need);
  const chosen = catalog.filter((s) => picked.includes(s.slug));
  const plan = PLANS.find((p) => p.slug === planSlug) ?? null;
  const plans = PLANS.filter((p) => p.need === need);
  const wantsCooking = plan ? plan.need !== "maid" : chosen.some((s) => s.category === "cook");
  const total = quote({ services: chosen, frequency: plan ? "month" : frequency, plan: plan ? { slug: plan.slug, price: plan.price } : null });

  const liveCities = (citiesQ.data ?? []).filter((c) => c.status === "live");
  const city = liveCities.find((c) => c.slug === form.citySlug);
  const self = form.forWhom === "Myself";

  const canNext = [
    !!plan || picked.length > 0,
    !!date,
    !!city && !!form.locality && city.localities.includes(form.locality) && form.address.trim().length > 2 && form.recipientName.trim().length > 1 && !!normalizePhone(form.phone),
    !submitting,
  ][step];

  const go = (d: number) => {
    haptic.tap();
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + d)));
  };

  const reset = () => {
    setBooking(null);
    setStep(0);
    setPicked([]);
    setPlanSlug(null);
    setFrequency("once");
    setEdited({});
  };

  const confirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.post<BookingDTO>("/bookings", {
        need,
        serviceSlugs: plan ? [] : picked,
        planSlug: plan?.slug ?? null,
        frequency: plan ? "month" : frequency,
        startDate: date,
        slot,
        citySlug: form.citySlug,
        locality: form.locality,
        address: form.address.trim(),
        forWhom: form.forWhom,
        recipientName: form.recipientName.trim(),
        phone: normalizePhone(form.phone),
        food: wantsCooking ? form.food : null,
        diets: wantsCooking ? form.diets : [],
        notes: form.notes.trim(),
      });
      haptic.success();
      setBooking(created);
      queryClient.invalidateQueries({ queryKey: keys.bookings });
      queryClient.invalidateQueries({ queryKey: keys.home });
    } catch (err) {
      haptic.error();
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (booking) return <Success booking={booking} onDone={reset} />;

  const footer = (
    <View style={styles.footer}>
      <View style={{ flex: 1 }}>
        <Text variant="caption">{plan ? "Monthly plan" : FREQUENCIES.find((f) => f.id === frequency)?.label}</Text>
        <Text style={styles.price} accessibilityLabel={`Estimated total ${formatINR(total)}`}>
          {formatINR(total)}
        </Text>
      </View>
      {step < STEPS.length - 1 ? (
        <Button label="Continue" onPress={() => go(1)} disabled={!canNext} style={{ minWidth: 150 }} />
      ) : (
        <Button label="Confirm booking" variant="accent" onPress={confirm} loading={submitting} style={{ minWidth: 170 }} />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen
        overline={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
        title={["What do you need?", "When should we come?", "Where, and for whom?", "Review your booking"][step]}
        right={step > 0 ? <BackButton onPress={() => go(-1)} /> : undefined}
        footer={footer}
      >
        <Progress step={step} />

        {step === 0 ? (
          <>
            <View style={{ flexDirection: "row", gap: space.xs }}>
              {NEEDS.map(({ id, title, text, Icon }) => {
                const on = need === id;
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${title}: ${text}`}
                    onPress={() => {
                      haptic.tap();
                      setNeed(id);
                      setPicked((p) => p.filter((slug) => id === "both" || catalog.find((s) => s.slug === slug)?.category === id));
                      if (plan && plan.need !== id) setPlanSlug(null);
                    }}
                    style={[styles.need, on && styles.needOn]}
                  >
                    <Icon size={24} color={on ? colors.white : colors.plum700} strokeWidth={1.8} />
                    <Text variant="label" style={{ color: on ? colors.white : colors.plum900, textAlign: "center" }}>
                      {title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text variant="subheading" style={{ marginTop: space.xs }}>
              Pick services
            </Text>
            {servicesQ.isPending ? <Skeleton height={88} radius={radii.md} /> : null}
            {options.map((s) => (
              <Option
                key={s.slug}
                selected={picked.includes(s.slug)}
                title={s.name}
                text={s.short}
                price={`${formatINR(s.price)} / ${UNIT_LABEL[s.unit] ?? s.unit}`}
                onPress={() => {
                  setPlanSlug(null);
                  setPicked((p) => (p.includes(s.slug) ? p.filter((x) => x !== s.slug) : [...p, s.slug]));
                }}
              />
            ))}

            {plans.length ? (
              <>
                <Text variant="subheading" style={{ marginTop: space.xs }}>
                  Or a monthly plan
                </Text>
                {plans.map((p) => (
                  <Option
                    key={p.slug}
                    selected={planSlug === p.slug}
                    title={`${p.name} · ${p.tag}`}
                    text={p.features.slice(0, 3).join(" · ")}
                    price={`${formatINR(p.price)} / month`}
                    onPress={() => {
                      setPicked([]);
                      setPlanSlug(planSlug === p.slug ? null : p.slug);
                    }}
                  />
                ))}
              </>
            ) : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            {!plan ? (
              <>
                <Text variant="subheading">How often?</Text>
                {FREQUENCIES.map((f) => (
                  <Option key={f.id} selected={frequency === f.id} title={f.label} text={f.note} onPress={() => setFrequency(f.id)} />
                ))}
              </>
            ) : (
              <Notice tone="info" text={`The ${plan.name} plan runs monthly, starting on the date you choose.`} />
            )}
            <Text variant="subheading" style={{ marginTop: space.xs }}>
              Start date
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.xs, paddingRight: space.lg }} style={{ marginHorizontal: -space.lg, paddingLeft: space.lg }}>
              {dates.map((d) => (
                <Chip key={d} label={shortDate(d)} selected={date === d} onPress={() => setDate(d)} />
              ))}
            </ScrollView>
            <Text variant="subheading" style={{ marginTop: space.xs }}>
              Time slot
            </Text>
            <View style={styles.wrap}>
              {SLOTS.map((s) => (
                <Chip key={s} label={s} selected={slot === s} onPress={() => setSlot(s)} />
              ))}
            </View>
          </>
        ) : null}

        {step === 2 ? (
          citiesQ.isError ? (
            <ErrorState message={errorMessage(citiesQ.error)} onRetry={() => citiesQ.refetch()} />
          ) : (
            <>
              <Text variant="subheading">City</Text>
              {citiesQ.isPending ? <Skeleton height={44} /> : null}
              <View style={styles.wrap}>
                {liveCities.map((c) => (
                  <Chip
                    key={c.slug}
                    label={c.name}
                    selected={form.citySlug === c.slug}
                    onPress={() => {
                      set("citySlug", c.slug);
                      if (!c.localities.includes(form.locality)) set("locality", "");
                    }}
                  />
                ))}
              </View>
              {city ? (
                <>
                  <Text variant="subheading" style={{ marginTop: space.xs }}>
                    Locality
                  </Text>
                  <View style={styles.wrap}>
                    {city.localities.map((l) => (
                      <Chip key={l} label={l} selected={form.locality === l} onPress={() => set("locality", l)} />
                    ))}
                  </View>
                </>
              ) : null}
              <Field label="House number and street" value={form.address} onChangeText={(t) => set("address", t)} placeholder="e.g. 10-2-30, Main Road" autoComplete="street-address" />

              <Text variant="subheading" style={{ marginTop: space.xs }}>
                Who is this for?
              </Text>
              <View style={styles.wrap}>
                {FOR_WHOM.map((w) => (
                  <Chip key={w} label={w} selected={form.forWhom === w} onPress={() => set("forWhom", w)} />
                ))}
              </View>
              <Field label={self ? "Your name" : "Her name"} value={form.recipientName} onChangeText={(t) => set("recipientName", t)} placeholder="Name" autoComplete="name" />
              <Field
                label={self ? "Your mobile number" : "Her mobile number"}
                hint="The helper calls this number when she arrives."
                value={form.phone}
                onChangeText={(t) => set("phone", t.replace(/[^\d+ ]/g, ""))}
                keyboardType="phone-pad"
                placeholder="10-digit mobile"
                maxLength={14}
              />

              {wantsCooking ? (
                <>
                  <Text variant="subheading" style={{ marginTop: space.xs }}>
                    Food preference
                  </Text>
                  <View style={styles.wrap}>
                    {FOOD.map((f) => (
                      <Chip key={f} label={f} selected={form.food === f} onPress={() => set("food", f)} />
                    ))}
                  </View>
                  <Text variant="subheading" style={{ marginTop: space.xs }}>
                    Diet needs
                  </Text>
                  <View style={styles.wrap}>
                    {DIETS.map((d) => (
                      <Chip key={d} label={d} selected={form.diets.includes(d)} onPress={() => set("diets", form.diets.includes(d) ? form.diets.filter((x) => x !== d) : [...form.diets, d])} />
                    ))}
                  </View>
                </>
              ) : null}
              <Field label="Anything we should know? (optional)" value={form.notes} onChangeText={(t) => set("notes", t)} multiline placeholder="Gate code, pets, how she likes things done…" maxLength={1000} />
            </>
          )
        ) : null}

        {step === 3 ? (
          <>
            <Card>
              <Row label="Services" value={plan ? `${plan.name} plan (${plan.tag})` : chosen.map((s) => s.name).join(", ")} />
              <Row label="How often" value={plan ? "Monthly" : (FREQUENCIES.find((f) => f.id === frequency)?.label ?? "")} />
              <Row label="Starts" value={`${dayLabel(date)} · ${slot}`} />
              <Row label="Address" value={`${form.address}, ${form.locality}, ${city?.name ?? ""}`} />
              <Row label="For" value={`${form.recipientName}${self ? "" : ` (${form.forWhom.toLowerCase()})`} · ${formatPhone(normalizePhone(form.phone) ?? form.phone)}`} />
              {wantsCooking ? <Row label="Food" value={[form.food, ...form.diets].join(", ")} /> : null}
              {form.notes ? <Row label="Notes" value={form.notes} /> : null}
              <View style={styles.totalRow}>
                <Text variant="subheading">Estimated total</Text>
                <Text style={styles.price}>{formatINR(total)}</Text>
              </View>
            </Card>
            <Notice tone="info" text="Your coordinator will call to confirm a verified helper before the first visit." />
            {error ? <Notice text={error} /> : null}
          </>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }} accessibilityLabel={`Step ${step + 1} of ${STEPS.length}`}>
      {STEPS.map((s, i) => (
        <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? (i < step ? colors.sage600 : colors.plum900) : colors.blush100 }} />
      ))}
    </View>
  );
}

function Option({ title, text, price, selected, onPress }: { title: string; text: string; price?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}. ${text}. ${price ?? ""}`}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && { opacity: 0.9 }]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption">{text}</Text>
        {price ? <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.blush600, marginTop: 2 }}>{price}</Text> : null}
      </View>
      <View style={[styles.check, selected && { backgroundColor: colors.plum900, borderColor: colors.plum900 }]}>{selected ? <Check size={16} color={colors.white} strokeWidth={3} /> : null}</View>
    </Pressable>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.blush50, gap: 2 }}>
      <Text variant="caption">{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

function Success({ booking, onDone }: { booking: BookingDTO; onDone: () => void }) {
  return (
    <Screen edges={["top"]} contentStyle={{ paddingTop: space.xxl, gap: space.lg }}>
      <View style={styles.successIcon}>
        <CircleCheckBig size={40} color={colors.sage600} strokeWidth={1.8} />
      </View>
      <View style={{ gap: space.xs }}>
        <Text variant="overline" style={{ textAlign: "center", color: colors.sage600 }}>
          Booking received
        </Text>
        <Text variant="title" style={{ textAlign: "center" }}>
          Request received
        </Text>
        <Text style={{ textAlign: "center", color: colors.textMuted }}>
          Booking {booking.code}. Your coordinator will call {formatPhone(booking.phone)} shortly to confirm the helper for {dayLabelInline(booking.startDate)}, {booking.slot.split(" · ")[0].toLowerCase()}.
        </Text>
      </View>
      <Button
        label="View booking"
        size="lg"
        onPress={() => {
          onDone();
          router.push(`/booking/${booking.id}`);
        }}
      />
      <Button label="Book something else" variant="secondary" onPress={onDone} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: space.xs },
  need: { flex: 1, minHeight: 104, borderRadius: radii.md, padding: space.sm, alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ring },
  needOn: { backgroundColor: colors.plum900, borderColor: colors.plum900 },
  option: { flexDirection: "row", alignItems: "center", gap: space.sm, padding: space.md, minHeight: 72, borderRadius: radii.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ring },
  optionOn: { borderColor: colors.plum500, backgroundColor: colors.blush50 },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: colors.blush300, alignItems: "center", justifyContent: "center" },
  footer: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.sm, backgroundColor: colors.ivory, borderTopWidth: 1, borderTopColor: colors.ring, ...shadow },
  price: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: colors.plum900 },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: space.md },
  successIcon: { alignSelf: "center", width: 88, height: 88, borderRadius: 44, backgroundColor: colors.sage100, alignItems: "center", justifyContent: "center" },
});
