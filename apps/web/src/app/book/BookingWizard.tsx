"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ChefHat, HeartHandshake, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import clsx from "clsx";
import { AREAS, CAREGIVERS, CITY, PLANS, SERVICES, formatINR, unsplash, type Need } from "@/lib/data";

const NEED_OPTIONS: { id: Need; title: string; text: string; icon: typeof Sparkles }[] = [
  { id: "maid", title: "Home help", text: "Cleaning, laundry, dishes", icon: Sparkles },
  { id: "cook", title: "Home cooking", text: "Fresh meals at home", icon: ChefHat },
  { id: "both", title: "Both", text: "Maid + cook together", icon: HeartHandshake },
];

const FOR_WHOM = ["My mother", "Myself", "Grandmother", "Another relative"];
const FOOD = ["Vegetarian", "Eggetarian", "Non-vegetarian"];
const DIETS = ["Diabetic-friendly", "Low salt", "Low oil", "Soft food", "Jain", "No onion-garlic"];

const FREQ = [
  { id: "once", label: "One visit", mult: 1, note: "Try us out" },
  { id: "week", label: "Daily for a week", mult: 7, note: "Save 5%", discount: 0.05 },
  { id: "month", label: "Monthly", mult: 26, note: "Save 15%", discount: 0.15 },
] as const;

const SLOTS = ["Morning · 7–11", "Midday · 11–2", "Evening · 5–8", "Full day · 8–8"];
const STEPS = ["Needs", "Schedule", "Details", "Review"];

const PLAN_NEED = { tidy: "maid", nourish: "cook", complete: "both" } as const;

const noopSubscribe = () => () => {};

export default function BookingWizard() {
  const params = useSearchParams();
  const preService = params.get("service");
  const prePlan = params.get("plan") as keyof typeof PLAN_NEED | null;
  const caregiver = CAREGIVERS.find((c) => c.id === params.get("caregiver"));
  const plan = PLANS.find((p) => p.id === prePlan);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [need, setNeed] = useState<Need>(
    plan ? PLAN_NEED[plan.id as keyof typeof PLAN_NEED] : (SERVICES.find((s) => s.id === preService)?.category ?? "maid"),
  );
  const [picked, setPicked] = useState<string[]>(preService ? [preService] : []);
  const [freq, setFreq] = useState<(typeof FREQ)[number]["id"]>("once");
  // Today's date is read on the client only (server snapshot is empty) so server and client markup never disagree.
  const today = useSyncExternalStore(noopSubscribe, () => new Date().toDateString(), () => "");
  const dates = useMemo(() => {
    if (!today) return [];
    const t = new Date(today);
    return Array.from({ length: 14 }, (_, i) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + i + 1));
  }, [today]);
  const [date, setDate] = useState(0);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [form, setForm] = useState({ name: "", phone: "", area: AREAS.includes(params.get("area") ?? "") ? params.get("area")! : "", address: "", notes: "", forWhom: FOR_WHOM[0], food: FOOD[0], diets: [] as string[] });
  const [done, setDone] = useState(false);

  const options = need === "both" ? SERVICES : SERVICES.filter((s) => s.category === need);
  const chosen = SERVICES.filter((s) => picked.includes(s.id));
  const wantsCooking = plan ? need !== "maid" : chosen.some((s) => s.category === "cook");
  const f = FREQ.find((x) => x.id === freq)!;

  const total = useMemo(() => {
    if (plan) return plan.price;
    // Only per-visit / per-day services repeat with frequency; monthly and one-off jobs are charged once.
    const recurring = chosen.filter((s) => s.unit === "visit" || s.unit === "day").reduce((sum, s) => sum + s.price, 0);
    const once = chosen.filter((s) => s.unit !== "visit" && s.unit !== "day").reduce((sum, s) => sum + s.price, 0);
    return Math.round(recurring * f.mult * (1 - ("discount" in f ? f.discount : 0)) + once);
  }, [chosen, f, plan]);

  const canNext = [plan ? true : picked.length > 0, dates.length > 0, form.name.trim() && form.phone.trim().length >= 8 && form.area && form.address.trim(), true][step];

  const go = (d: number) => {
    setDir(d);
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + d)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirm = () => {
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) return <Success name={form.name} date={dates[date]} slot={slot} />;

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
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <div>
                  <h2 className="font-display text-3xl font-medium text-plum-900">What does she need?</h2>
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
                        What would help? <span className="font-normal text-plum-700/60">Pick one or more</span>
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
                      {FREQ.map((x) => (
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
                          date === i ? "bg-blush-500 text-white ring-blush-500" : "ring-blush-100 hover:ring-blush-300",
                        )}
                      >
                        <span className={clsx("text-[11px] uppercase", date === i ? "text-white/80" : "text-plum-700/50")}>
                          {d.toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                        <span className="font-display text-2xl">{d.getDate()}</span>
                        <span className={clsx("text-[11px]", date === i ? "text-white/80" : "text-plum-700/50")}>
                          {d.toLocaleDateString("en-IN", { month: "short" })}
                        </span>
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
                  <h2 className="font-display text-3xl font-medium text-plum-900">A little about her</h2>
                  <p className="mt-2 text-sm text-plum-700/60">Shared only with your care manager and the maid or cook you choose.</p>
                  <p className="mt-6 text-sm font-semibold text-plum-900">Who is this for?</p>
                  <Chips options={FOR_WHOM} selected={[form.forWhom]} onToggle={(v) => setForm({ ...form, forWhom: v })} />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Her name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Saroja Devi" />
                    <Field label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 98xxxxxx10" type="tel" />
                    <label>
                      <span className="text-sm font-semibold text-plum-900">Locality in {CITY.name}</span>
                      <select
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
                        className="mt-2 w-full rounded-2xl bg-cream px-4 py-3 text-sm text-plum-900 ring-1 ring-blush-100 focus:ring-2 focus:ring-blush-300 focus:outline-none"
                      >
                        <option value="">Choose her locality</option>
                        {AREAS.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </label>
                    <Field
                      label="House no. & street"
                      value={form.address}
                      onChange={(v) => setForm({ ...form, address: v })}
                      placeholder="e.g. 12-3-45, 4th Cross"
                    />
                    <p className="-mt-2 flex items-center gap-1.5 text-xs text-plum-700/60 sm:col-span-2">
                      <MapPin className="size-3.5 text-blush-500" /> We currently serve {CITY.name} only. More cities coming soon.
                    </p>
                    <label className="sm:col-span-2">
                      <span className="text-sm font-semibold text-plum-900">Anything we should know?</span>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={3}
                        placeholder="Her routine, preferred language, keys, pets…"
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
                  <h2 className="font-display text-3xl font-medium text-plum-900">Looks lovely. Ready?</h2>
                  <dl className="mt-6 divide-y divide-blush-100 rounded-3xl bg-cream px-5 ring-1 ring-blush-100">
                    {[
                      ["Needs", NEED_OPTIONS.find((w) => w.id === need)!.title],
                      ["Services", plan ? `${plan.name} plan` : chosen.map((s) => s.name).join(", ")],
                      ["Frequency", plan ? plan.period : f.label],
                      ["Starts", dates[date]?.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) ?? "-"],
                      ["Time", slot],
                      ["For", `${form.name} (${form.forWhom.toLowerCase()})`],
                      ["Address", `${form.address}, ${form.area}, ${CITY.name}`],
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
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-blush-100 pt-6">
          <button
            onClick={() => go(-1)}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-plum-700 transition-opacity hover:bg-blush-50 disabled:opacity-0"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <button
            onClick={() => (step === STEPS.length - 1 ? confirm() : go(1))}
            disabled={!canNext}
            className="group flex items-center gap-2 rounded-full bg-plum-900 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blush-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-plum-900"
          >
            {step === STEPS.length - 1 ? "Confirm booking" : "Continue"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <aside className="h-fit space-y-4 lg:sticky lg:top-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-plum-900 p-6 text-white">
          <div className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-blush-500/40 blur-3xl" />
          <p className="relative text-xs font-semibold tracking-widest text-blush-200 uppercase">Estimated total</p>
          <motion.p key={total} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative mt-2 font-display text-5xl">
            {formatINR(total)}
          </motion.p>
          <p className="relative mt-1 text-sm text-white/60">{plan ? `per ${plan.period}` : f.mult === 1 ? "for one visit" : `${f.label.toLowerCase()}`}</p>
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
            <Image src={unsplash(caregiver.image, 120, 120)} alt="" width={52} height={52} className="size-13 rounded-2xl object-cover" />
            <div>
              <p className="text-xs text-plum-700/60">Requested helper</p>
              <p className="font-semibold text-plum-900">{caregiver.name}</p>
              <p className="text-xs text-plum-700/60">
                {caregiver.role} · ★ {caregiver.rating}
              </p>
            </div>
          </div>
        )}
        <div className="rounded-[1.5rem] bg-sage-100 p-5 text-sm text-plum-700">
          <p className="flex items-center gap-2 font-semibold text-plum-900">
            <ShieldCheck className="size-4 text-sage-600" /> The Nestly promise
          </p>
          <p className="mt-1.5">Replacement within 24 hours if it isn&apos;t a perfect fit. Pause or cancel anytime.</p>
        </div>
      </aside>
    </div>
  );
}

function Chips({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl bg-cream px-4 py-3 text-sm text-plum-900 ring-1 ring-blush-100 placeholder:text-plum-700/40 focus:ring-2 focus:ring-blush-300 focus:outline-none"
      />
    </label>
  );
}

const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2;
  const dist = 120 + (i % 5) * 28;
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, color: ["#e57a93", "#c9b8f0", "#f7c3a1", "#b5c9ae", "#e7b45f"][i % 5], r: (i * 47) % 360 };
});

function Success({ name, date, slot }: { name: string; date?: Date; slot: string }) {
  return (
    <div className="mx-auto max-w-xl px-6 pb-24 text-center">
      <div className="relative mx-auto grid size-32 place-items-center">
        {CONFETTI.map((c, i) => (
          <motion.span
            key={i}
            className="absolute size-2.5 rounded-sm"
            style={{ background: c.color }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
            animate={{ x: c.x, y: c.y, opacity: 0, rotate: c.r, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.25 }}
          />
        ))}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 15 }}
          className="grid size-28 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-plum-500 shadow-[0_20px_50px_-15px_rgb(212_86_119/0.7)]"
        >
          <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.5 }} />
          </svg>
        </motion.span>
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="mt-8 font-display text-4xl font-medium text-plum-900">You&apos;re all set{name ? `, ${name.split(" ")[0]}` : ""}!</h2>
        <p className="mt-3 text-plum-700/75">
          Your care manager will call within 15 minutes to introduce your matched helpers for{" "}
          <span className="font-semibold text-plum-900">
            {date?.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}, {slot.split(" · ")[0].toLowerCase()}
          </span>
          .
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="rounded-full bg-plum-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blush-600">
            Open family dashboard
          </Link>
          <Link href="/" className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-plum-900 ring-1 ring-blush-100 hover:bg-blush-50">
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
