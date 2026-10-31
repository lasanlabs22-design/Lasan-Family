"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Send } from "lucide-react";
import clsx from "clsx";
import { ApiRequestError } from "@lasan/shared";
import { api } from "@/lib/client";
import { LANGUAGES, SERVICES, STATES, type CityDTO } from "@/lib/data";

const input =
  "mt-2 w-full rounded-2xl bg-cream px-4 py-3 text-sm text-plum-900 ring-1 ring-blush-100 placeholder:text-plum-700/40 focus:ring-2 focus:ring-blush-300 focus:outline-none";

export default function ApplyForm({ cities }: { cities: CityDTO[] }) {
  const [form, setForm] = useState({ name: "", phone: "", citySlug: "", locality: "", experience: "1-3" });
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["Telugu"]);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const toggle = (xs: string[], x: string) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skills.length) return setError("Pick at least one skill.");
    setState("sending");
    setError("");
    try {
      await api.post("/applications", { ...form, skills, languages });
      setState("sent");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "We couldn't send your application. Please try again.");
      setState("idle");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2.25rem] bg-white p-7 shadow-[0_40px_80px_-40px_rgb(77_38_73/0.35)] ring-1 ring-blush-100 sm:p-9">
      <AnimatePresence mode="wait">
        {state === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-sage-100 text-sage-600">
              <Check className="size-9" strokeWidth={3} />
            </span>
            <h3 className="mt-6 font-display text-3xl text-plum-900">Application received</h3>
            <p className="mt-2 text-plum-700/70">Our team will call you within 2 working days. Welcome to Lasan Family.</p>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0, scale: 0.98 }} onSubmit={submit}>
            <h3 className="font-display text-3xl font-medium text-plum-900">Apply now</h3>
            <p className="mt-1 text-sm text-plum-700/60">Takes less than 5 minutes.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-plum-900">Full name</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} placeholder="e.g. Padmavathi" />
              </label>
              <label>
                <span className="text-sm font-semibold text-plum-900">Mobile number</span>
                <input required type="tel" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} placeholder="10-digit number" />
              </label>
              <label>
                <span className="text-sm font-semibold text-plum-900">City</span>
                <select required className={input} value={form.citySlug} onChange={(e) => setForm({ ...form, citySlug: e.target.value })}>
                  <option value="" disabled>
                    Your city
                  </option>
                  {STATES.map((s) => (
                    <optgroup key={s.code} label={s.name}>
                      {cities
                        .filter((c) => c.state === s.code)
                        .map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-semibold text-plum-900">Locality</span>
                <input value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} className={input} placeholder="e.g. Kukatpally" />
              </label>
              <label className="sm:col-span-2">
                <span className="text-sm font-semibold text-plum-900">Years of experience</span>
                <select className={input} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}>
                  <option value="0">New to this work</option>
                  <option value="1-3">1–3 years</option>
                  <option value="3-7">3–7 years</option>
                  <option value="7+">7+ years</option>
                </select>
              </label>
            </div>
            <ChipSet legend="What can you offer?" items={SERVICES.map((s) => ({ id: s.id, label: s.name, icon: s.icon }))} selected={skills} onToggle={(id) => setSkills((k) => toggle(k, id))} />
            <ChipSet legend="Languages you speak" items={LANGUAGES.map((l) => ({ id: l, label: l }))} selected={languages} onToggle={(id) => setLanguages((k) => toggle(k, id))} />
            {error && <p className="mt-5 rounded-2xl bg-blush-50 px-4 py-3 text-sm font-medium text-blush-600">{error}</p>}
            <button
              type="submit"
              disabled={state === "sending"}
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-plum-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-blush-600 disabled:opacity-60"
            >
              {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : null}
              Submit application {state !== "sending" && <Send className="size-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChipSet({
  legend,
  items,
  selected,
  onToggle,
}: {
  legend: string;
  items: { id: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-semibold text-plum-900">{legend}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((s) => {
          const on = selected.includes(s.id);
          return (
            <button
              type="button"
              key={s.id}
              aria-pressed={on}
              onClick={() => onToggle(s.id)}
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ring-1 transition-all",
                on ? "bg-plum-900 text-white ring-plum-900" : "text-plum-700 ring-blush-100 hover:ring-blush-300",
              )}
            >
              {s.icon && <s.icon className="size-3.5" />}
              {s.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
