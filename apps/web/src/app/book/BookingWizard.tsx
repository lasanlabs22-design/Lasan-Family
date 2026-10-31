"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ChefHat, HeartHandshake, Loader2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import clsx from "clsx";
import { ApiRequestError, type BookingDTO } from "@lasan/shared";
import { api } from "@/lib/client";
import { DIETS, FOOD, FOR_WHOM, FREQUENCIES, PLANS, SERVICES, SLOTS, formatINR, quote, unsplash, type CityDTO, type Need, type ProviderDTO } from "@/lib/data";

const NEED_OPTIONS: { id: Need; title: string; text: string; icon: typeof Sparkles }[] = [
  { id: "maid", title: "Home help", text: "Cleaning, laundry, dishes", icon: Sparkles },
  { id: "cook", title: "Home cooking", text: "Fresh meals at home", icon: ChefHat },
  { id: "both", title: "Both", text: "Maid + cook together", icon: HeartHandshake },
];

const STEPS = ["Needs", "Schedule", "Details", "Review"];
type FreqId = (typeof FREQUENCIES)[number]["id"];

const noopSubscribe = () => () => {};
const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const longDate = (d?: Date) => d?.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) ?? "-";

export default function BookingWizard({ cities, providers }: { cities: CityDTO[]; providers: ProviderDTO[] }) {
  const params = useSearchParams();
  const preService = params.get("service");
  const plan = PLANS.find((p) => p.id === params.get("plan"));
  const caregiver = providers.find((c) => c.id === params.get("caregiver"));
  const liveCities = cities.filter((c) => c.status === "live");

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [need, setNeed] = useState<Need>(plan ? plan.need : (SERVICES.find((s) => s.id === preService)?.category ?? "maid"));
  const [picked, setPicked] = useState<string[]>(preService && SERVICES.some((s) => s.id === preService) ? [preService] : []);
  const [freq, setFreq] = useState<FreqId>("once");
  // Today's date is read on the client only (server snapshot is empty) so server and client markup never disagree.
  const today = useSyncExternalStore(noopSubscribe, () => new Date().toDateString(), () => "");
  const dates = useMemo(() => {
    if (!today) return [];
    const t = new Date(today);
    return Array.from({ length: 14 }, (_, i) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + i + 1));
  }, [today]);
  const [date, setDate] = useState(0);
  const [slot, setSlot] = useState<(typeof SLOTS)[number]>(SLOTS[0]);

  const initialCity = liveCities.find((c) => c.slug === (params.get("city") ?? caregiver?.citySlug))?.slug ?? "";
  const initialLocality = liveCities.find((c) => c.slug === initialCity)?.localities.includes(params.get("locality") ?? "") ? params.get("locality")! : "";
  const [form, setForm] = useState({
    name: "",
    phone: "",
    citySlug: initialCity,
    locality: initialLocality,
    address: "",
    notes: "",
    forWhom: FOR_WHOM[0] as (typeof FOR_WHOM)[number],
    food: FOOD[0] as (typeof FOOD)[number],
    diets: [] as (typeof DIETS)[number][],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingDTO | null>(null);

  const city = liveCities.find((c) => c.slug === form.citySlug);
  const options = need === "both" ? SERVICES : SERVICES.filter((s) => s.category === need);
  const chosen = SERVICES.filter((s) => picked.includes(s.id));
  const wantsCooking = plan ? need !== "maid" : chosen.some((s) => s.category === "cook");
  const f = FREQUENCIES.find((x) => x.id === freq)!;
  const total = quote({ services: chosen, frequency: freq, plan: plan ? { slug: plan.slug, price: plan.price } : null });
  const self = form.forWhom === "Myself";

  const canNext = [
    plan ? true : picked.length > 0,
    dates.length > 0,
    form.name.trim().length > 1 && form.phone.replace(/\D/g, "").length >= 10 && form.locality && form.address.trim().length > 2,
    !submitting,
  ][step];

  const go = (d: number) => {
    setDir(d);
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + d)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      const created = await api.post<BookingDTO>("/bookings", {
        need,
        serviceSlugs: plan ? [] : picked,
        planSlug: plan?.slug ?? null,
        frequency: freq,
        startDate: isoDate(dates[date]),
        slot,
        citySlug: form.citySlug,
        locality: form.locality,
        address: form.address,
        forWhom: form.forWhom,
        recipientName: form.name,
        phone: form.phone,
        food: wantsCooking ? form.food : null,
        diets: wantsCooking ? form.diets : [],
        notes: form.notes,
        providerId: caregiver?.id ?? null,
      });
      setBooking(created);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "We couldn't reach Lasan Family. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (booking) return <Success booking={booking} date={dates[date]} />;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 sm:px-6 lg:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-[2.25rem] bg-white p-6 ring-1 ring-blush-100 sm:p-10">
        {/* Progress */}
        <ol className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <span
                className={clsx(
                  "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-500",
                  i < step ? "bg-sage-600 text-white" : i === step ? "bg-plum-900 text-white" : "bg-blush-50 text-plum-700/50",
                )}
              >
                {i < step ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={clsx("hidden text-sm font-semibold sm:block", i === step ? "text-plum-900" : "text-plum-700/50")}>{s}</span>
              {i < STEPS.length - 1 && (
                <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-blush-50">
                  <motion.span className="absolute inset-y-0 left-0 bg-sage-600" animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="relative mt-10 min-h-[420px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <div>
                  <h2 className="font-display text-3xl font-medium text-plum-900">What do you need help with?</h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {NEED_OPTIONS.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setNeed(w.id);
                          setPicked((p) => p.filter((id) => w.id === "both" || SERVICES.find((s) => s.id === id)?.category === w.id));
                        }}
                        aria-pressed={need === w.id}
                        className={clsx(
                          "rounded-3xl p-5 text-left transition-all",
                          need === w.id ? "bg-plum-900 text-white shadow-lg" : "bg-cream text-plum-900 ring-1 ring-blush-100 hover:ring-blush-300",
                        )}
                      >
                        <w.icon className={clsx("size-6", need === w.id ? "text-blush-300" : "text-blush-500")} />
                        <p className="mt-4 font-semibold">{w.title}</p>
                        <p className={clsx("text-sm", need === w.id ? "text-white/65" : "text-plum-700/60")}>{w.text}</p>
                      </button>
                    ))}
                  </div>

                  {plan ? (
                    <div className="mt-8 flex items-center gap-4 rounded-3xl bg-blush-50 p-5">
                      <Sparkles className="size-6 shrink-0 text-blush-500" />
                      <p className="text-sm text-plum-700">
                        You&apos;re booking the <span className="font-semibold text-plum-900">{plan.name}</span> plan. It includes{" "}
                        {plan.features.slice(0, 3).join(", ").toLowerCase()} and more.
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 className="mt-10 font-semibold text-plum-900">
                        Choose services <span className="font-normal text-plum-700/60">Pick one or more</span>
                      </h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {options.map((s) => {
                          const on = picked.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              onClick={() => setPicked((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]))}
                              aria-pressed={on}
                              className={clsx(
                                "flex items-center gap-3 rounded-2xl p-3.5 text-left ring-1 transition-all",
                                on ? "bg-blush-50 ring-2 ring-blush-400" : "ring-blush-100 hover:ring-blush-300",
                              )}
                            >
                              <span className={clsx("grid size-10 shrink-0 place-items-center rounded-xl", on ? "bg-blush-500 text-white" : "bg-cream text-blush-600")}>
                                <s.icon className="size-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-plum-900">{s.name}</span>
                                <span className="text-xs text-plum-700/60">
                                  {formatINR(s.price)} / {s.unit}
                                </span>
                              </span>
                              <span className={clsx("grid size-5 place-items-center rounded-full border-2", on ? "border-blush-500 bg-blush-500" : "border-blush-200")}>
                                {on && <Check className="size-3 text-white" strokeWidth={3} />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="font-display text-3xl font-medium text-plum-900">When should we start?</h2>
                  {!plan && (
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {FREQUENCIES.map((x) => (
                        <button
                          key={x.id}
                          onClick={() => setFreq(x.id)}
                          aria-pressed={freq === x.id}
                          className={clsx(
                            "rounded-2xl p-4 text-left ring-1 transition-all",
                            freq === x.id ? "bg-plum-900 text-white ring-plum-900" : "ring-blush-100 hover:ring-blush-300",
                          )}
                        >
                          <p className="font-semibold">{x.label}</p>
                          <p className={clsx("text-xs", freq === x.id ? "text-blush-200" : "text-sage-600")}>{x.note}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  <h3 className="mt-8 font-semibold text-plum-900">Start date</h3>
                  <div className="-mx-2 mt-3 flex gap-2 overflow-x-auto px-2 pb-2 [scrollbar-width:thin]">
                    {dates.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setDate(i)}
                        aria-pressed={date === i}
                        className={clsx(
                          "flex w-16 shrink-0 flex-col items-center rounded-2xl py-3 ring-1 transition-all",
                          date === i ? "bg-plum-900 text-white ring-plum-900" : "ring-blush-100 hover:ring-blush-300",
                        )}
                      >
                        <span className={clsx("text-[11px] uppercase", date === i ? "text-white/70" : "text-plum-700/50")}>
                          {d.toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                        <span className="font-display text-2xl">{d.getDate()}</span>
                        <span className={clsx("text-[11px]", date === i ? "text-white/70" : "text-plum-700/50")}>{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                      </button>
                    ))}
                  </div>
                  <h3 className="mt-8 font-semibold text-plum-900">Preferred time</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {SLOTS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSlot(s)}
                        aria-pressed={slot === s}
                        className={clsx(
                          "rounded-2xl px-3 py-3 text-sm font-medium ring-1 transition-all",
                          slot === s ? "bg-plum-900 text-white ring-plum-900" : "text-plum-700 ring-blush-100 hover:ring-blush-300",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-display text-3xl font-medium text-plum-900">A few details</h2>
                  <p className="mt-2 text-sm text-plum-700/60">Shared only with your Lasan Family coordinator and the helper assigned to you.</p>
                  <p className="mt-6 text-sm font-semibold text-plum-900">Who is this for?</p>
                  <Chips options={FOR_WHOM} selected={[form.forWhom]} onToggle={(v) => setForm({ ...form, forWhom: v })} />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label={self ? "Your name" : "Her name"} value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Saroja Devi" />
                    <Field
                      label={self ? "Your mobile number" : "Contact number"}
                      value={form.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                      placeholder="10-digit mobile number"
                      type="tel"
                    />
                    <SelectField
                      label="City"
                      value={form.citySlug}
                      onChange={(v) => setForm({ ...form, citySlug: v, locality: "" })}
                      placeholder="Choose a city"
                      options={liveCities.map((c) => ({ value: c.slug, label: `${c.name}, ${c.stateName}` }))}
                    />
                    <SelectField
                      label="Locality"
                      value={form.locality}
                      onChange={(v) => setForm({ ...form, locality: v })}
                      placeholder={city ? "Choose a locality" : "Choose a city first"}
                      options={(city?.localities ?? []).map((l) => ({ value: l, label: l }))}
                      disabled={!city}
                    />
                    <Field
                      label="House no. & street"
                      value={form.address}
                      onChange={(v) => setForm({ ...form, address: v })}
                      placeholder="e.g. Flat 402, Aparna Towers, 4th Cross"
                      className="sm:col-span-2"
                    />
                    <p className="-mt-2 flex items-center gap-1.5 text-xs text-plum-700/60 sm:col-span-2">
                      <MapPin className="size-3.5 text-blush-500" /> Not in a listed locality?{" "}
                      <Link href="/#cities" className="font-semibold text-plum-900 underline-offset-2 hover:underline">
                        Join the waitlist
                      </Link>
                    </p>
                    <label className="sm:col-span-2">
                      <span className="text-sm font-semibold text-plum-900">Anything we should know?</span>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={3}
                        placeholder="Routine, preferred language, keys, pets…"
                        className="mt-2 w-full rounded-2xl bg-cream px-4 py-3 text-sm text-plum-900 ring-1 ring-blush-100 placeholder:text-plum-700/40 focus:ring-2 focus:ring-blush-300 focus:outline-none"
                      />
                    </label>
                  </div>
                  {wantsCooking && (
                    <div className="mt-6 rounded-3xl bg-peach-100/60 p-5 ring-1 ring-peach-300/50">
                      <p className="flex items-center gap-2 text-sm font-semibold text-plum-900">
                        <ChefHat className="size-4 text-blush-600" /> Food preferences for the cook
                      </p>
                      <Chips options={FOOD} selected={[form.food]} onToggle={(v) => setForm({ ...form, food: v })} />
                      <p className="mt-4 text-xs font-semibold tracking-wide text-plum-700/60 uppercase">Diet needs · pick any</p>
                      <Chips
                        options={DIETS}
                        selected={form.diets}
                        onToggle={(v) => setForm({ ...form, diets: form.diets.includes(v) ? form.diets.filter((d) => d !== v) : [...form.diets, v] })}
                      />
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-display text-3xl font-medium text-plum-900">Review and confirm</h2>
                  <dl className="mt-6 divide-y divide-blush-100 rounded-3xl bg-cream px-5 ring-1 ring-blush-100">
                    {[
                      ["Needs", NEED_OPTIONS.find((w) => w.id === need)!.title],
                      ["Services", plan ? `${plan.name} plan` : chosen.map((s) => s.name).join(", ")],
                      ["Frequency", plan ? "Monthly" : f.label],
                      ["Starts", longDate(dates[date])],
                      ["Time", slot],
                      ["For", `${form.name} (${form.forWhom.toLowerCase()})`],
                      ["Address", `${form.address}, ${form.locality}, ${city?.name ?? ""}`],
                      ...(caregiver ? [["Requested helper", caregiver.name]] : []),
                      ...(wantsCooking ? [["Food", [form.food, ...form.diets].join(", ")]] : []),
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-6 py-3.5 text-sm">
                        <dt className="text-plum-700/60">{k}</dt>
                        <dd className="text-right font-medium text-plum-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 flex items-center gap-2 text-xs text-plum-700/60">
                    <ShieldCheck className="size-4 text-sage-600" /> You won&apos;t be charged until after the first visit is complete.
                  </p>
                  {error && <p className="mt-4 rounded-2xl bg-blush-50 px-4 py-3 text-sm font-medium text-blush-600 ring-1 ring-blush-100">{error}</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-blush-100 pt-6">
          <button
            onClick={() => go(-1)}
            disabled={step === 0 || submitting}
            className="flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-plum-700 transition-opacity hover:bg-blush-50 disabled:opacity-0"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <button
            onClick={() => (step === STEPS.length - 1 ? confirm() : go(1))}
            disabled={!canNext}
            className="group flex items-center gap-2 rounded-full bg-plum-900 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blush-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-plum-900"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {step === STEPS.length - 1 ? (submitting ? "Confirming…" : "Confirm booking") : "Continue"}
            {!submitting && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </div>
      </div>

      {/* Summary */}
      <aside className="h-fit space-y-4 lg:sticky lg:top-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-plum-900 p-6 text-white">
          <div className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-blush-500/30 blur-3xl" />
          <p className="relative text-xs font-semibold tracking-widest text-blush-200 uppercase">Estimated total</p>
          <p className="relative mt-2 font-display text-5xl">{formatINR(total)}</p>
          <p className="relative mt-1 text-sm text-white/60">{plan ? "per month" : f.mult === 1 ? "for one visit" : f.label.toLowerCase()}</p>
          <ul className="relative mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
            {plan ? (
              plan.features.map((x) => (
                <li key={x} className="flex items-center gap-2 text-white/80">
                  <Check className="size-3.5 text-blush-300" /> {x}
                </li>
              ))
            ) : chosen.length ? (
              chosen.map((s) => (
                <li key={s.id} className="flex justify-between text-white/80">
                  <span>{s.name}</span>
                  <span>
                    {formatINR(s.price)}
                    <span className="text-white/50">/{s.unit}</span>
                  </span>
                </li>
              ))
            ) : (
              <li className="text-white/50">Pick a service to see your estimate</li>
            )}
          </ul>
        </div>
        {caregiver && (
          <div className="flex items-center gap-3 rounded-[1.5rem] bg-white p-4 ring-1 ring-blush-100">
            <Image src={unsplash(caregiver.photo, 120, 120)} alt="" width={52} height={52} className="size-13 rounded-2xl object-cover" />
            <div>
              <p className="text-xs text-plum-700/60">Requested helper</p>
              <p className="font-semibold text-plum-900">{caregiver.name}</p>
              <p className="text-xs text-plum-700/60">
                {caregiver.title} · {caregiver.cityName} · ★ {caregiver.rating}
              </p>
            </div>
          </div>
        )}
        <div className="rounded-[1.5rem] bg-sage-100 p-5 text-sm text-plum-700">
          <p className="flex items-center gap-2 font-semibold text-plum-900">
            <ShieldCheck className="size-4 text-sage-600" /> The Lasan Family promise
          </p>
          <p className="mt-1.5">A replacement within 24 hours if it isn&apos;t the right fit. Pause or cancel anytime.</p>
        </div>
      </aside>
    </div>
  );
}

function Chips<T extends string>({ options, selected, onToggle }: { options: readonly T[]; selected: T[]; onToggle: (v: T) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            aria-pressed={on}
            className={clsx(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1 transition-all",
              on ? "bg-plum-900 text-white ring-plum-900" : "bg-white text-plum-700 ring-blush-100 hover:ring-blush-300",
            )}
          >
            {on && <Check className="size-3.5" strokeWidth={3} />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

const fieldClass =
  "mt-2 w-full rounded-2xl bg-cream px-4 py-3 text-sm text-plum-900 ring-1 ring-blush-100 placeholder:text-plum-700/40 focus:ring-2 focus:ring-blush-300 focus:outline-none disabled:opacity-50";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-semibold text-plum-900">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={fieldClass} />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-plum-900">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={fieldClass}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Success({ booking, date }: { booking: BookingDTO; date?: Date }) {
  return (
    <div className="mx-auto max-w-xl px-6 pb-24 text-center">
      <motion.span
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto grid size-24 place-items-center rounded-full bg-plum-900 shadow-[0_20px_50px_-20px_rgb(77_38_73/0.7)]"
      >
        <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.45 }} />
        </svg>
      </motion.span>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p className="mt-8 text-xs font-semibold tracking-[0.16em] text-blush-600 uppercase">Booking {booking.code}</p>
        <h2 className="mt-2 font-display text-4xl font-medium text-plum-900">Request received</h2>
        <p className="mt-3 text-plum-700/75">
          Your coordinator will call <span className="font-semibold text-plum-900">{booking.phone.replace("+91", "+91 ")}</span> shortly to confirm the helper for{" "}
          <span className="font-semibold text-plum-900">
            {longDate(date)}, {booking.slot.split(" · ")[0].toLowerCase()}
          </span>
          .
        </p>
        <div className="mx-auto mt-8 max-w-sm rounded-3xl bg-white p-5 text-left ring-1 ring-blush-100">
          <div className="flex justify-between text-sm">
            <span className="text-plum-700/60">Estimated total</span>
            <span className="font-semibold text-plum-900">{formatINR(booking.total)}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-plum-700/60">
            Sign in to the Lasan Family app with this phone number to follow every visit: check-ins, meal photos and notes.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="rounded-full bg-plum-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blush-600">
            See the app
          </Link>
          <Link href="/" className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-plum-900 ring-1 ring-blush-100 hover:bg-blush-50">
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
