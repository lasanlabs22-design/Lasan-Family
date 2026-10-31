"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BellRing, Check, ChevronDown, MapPin } from "lucide-react";
import clsx from "clsx";
import { ApiRequestError } from "@lasan/shared";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { api } from "@/lib/client";
import { STATES, type CityDTO } from "@/lib/data";

const OTHER = "__other";

export default function ServiceArea({ cities }: { cities: CityDTO[] }) {
  const [citySlug, setCitySlug] = useState("");
  const [locality, setLocality] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "joined">("idle");
  const [error, setError] = useState("");

  const city = cities.find((c) => c.slug === citySlug);
  const covered = city?.status === "live" && locality !== "" && locality !== OTHER;
  const waitlist = (city && city.status !== "live") || locality === OTHER;

  const choose = (slug: string) => {
    setCitySlug(slug);
    setLocality("");
    setState("idle");
    setError("");
  };

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      await api.post("/leads", { phone, city: city?.name ?? "", locality: locality === OTHER ? "" : locality, source: "website" });
      setState("joined");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't save that. Please try again.");
      setState("idle");
    }
  };

  return (
    <section id="cities" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Where we serve"
            title={
              <>
                Across <em className="text-gradient">two states</em>, close to home
              </>
            }
            text="Every helper lives in the city she works in, speaks your language and reaches your door on time. Pick your city to check your locality."
          />

          <Reveal delay={0.1} className="mt-10 grid gap-4 sm:grid-cols-2">
            {STATES.map((s) => (
              <div key={s.code} className="rounded-[1.75rem] bg-white p-6 ring-1 ring-blush-100">
                <p className="text-xs font-semibold tracking-[0.14em] text-plum-700/50 uppercase">{s.name}</p>
                <ul className="mt-4 space-y-1">
                  {cities
                    .filter((c) => c.state === s.code)
                    .sort((a, b) => Number(b.status === "live") - Number(a.status === "live"))
                    .map((c) => (
                      <li key={c.slug}>
                        <button
                          onClick={() => choose(c.slug)}
                          className={clsx(
                            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                            citySlug === c.slug ? "bg-plum-900 text-white" : "hover:bg-blush-50",
                          )}
                        >
                          <span className="font-medium">{c.name}</span>
                          {c.status === "live" ? (
                            <span className={clsx("flex items-center gap-1.5 text-xs", citySlug === c.slug ? "text-white/70" : "text-sage-600")}>
                              <span className="size-1.5 rounded-full bg-current" /> Live
                            </span>
                          ) : (
                            <span className={clsx("text-xs", citySlug === c.slug ? "text-white/60" : "text-plum-700/45")}>Coming soon</span>
                          )}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal delay={0.15} className="rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-50px_rgb(77_38_73/0.45)] ring-1 ring-blush-100 sm:p-8 lg:mt-24">
          <p className="font-display text-2xl font-medium text-plum-900">Check your locality</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Select label="City" value={citySlug} onChange={choose} placeholder="Choose a city">
              {STATES.map((s) => (
                <optgroup key={s.code} label={s.name}>
                  {cities
                    .filter((c) => c.state === s.code)
                    .map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                        {c.status === "live" ? "" : " (coming soon)"}
                      </option>
                    ))}
                </optgroup>
              ))}
            </Select>
            <Select
              label="Locality"
              value={locality}
              onChange={(v) => {
                setLocality(v);
                setState("idle");
              }}
              placeholder={city?.status === "live" ? "Choose a locality" : "Pick a live city first"}
              disabled={city?.status !== "live"}
            >
              {city?.localities.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
              <option value={OTHER}>My area isn&apos;t listed</option>
            </Select>
          </div>

          <AnimatePresence mode="wait">
            {covered && (
              <motion.div key="yes" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-sage-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-start gap-2 text-sm text-plum-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-sage-600" strokeWidth={3} />
                    <span>
                      <span className="font-semibold text-plum-900">
                        We serve {locality}, {city!.name}.
                      </span>{" "}
                      First visit as early as tomorrow.
                    </span>
                  </p>
                  <Link
                    href={`/book?city=${city!.slug}&locality=${encodeURIComponent(locality)}`}
                    className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-plum-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blush-600"
                  >
                    Book now <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            )}
            {waitlist && (
              <motion.div key="no" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-5 rounded-2xl bg-peach-100/70 p-4">
                  {state === "joined" ? (
                    <p className="flex items-center gap-2 text-sm font-medium text-plum-900">
                      <Check className="size-4 text-sage-600" strokeWidth={3} /> You&apos;re on the list. We&apos;ll WhatsApp you the day we launch near you.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-plum-700">
                        {city?.status !== "live" ? `We're launching in ${city?.name} soon.` : "We're not in your area yet."} Leave your WhatsApp number and you&apos;ll hear first.
                      </p>
                      <form className="mt-3 flex gap-2" onSubmit={join}>
                        <label htmlFor="waitlist-phone" className="sr-only">
                          WhatsApp number
                        </label>
                        <input
                          id="waitlist-phone"
                          type="tel"
                          inputMode="numeric"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 text-sm text-plum-900 ring-1 ring-blush-100 focus:ring-2 focus:ring-blush-300 focus:outline-none"
                        />
                        <button
                          disabled={state === "sending" || phone.replace(/\D/g, "").length < 10}
                          className="flex shrink-0 items-center gap-1.5 rounded-full bg-plum-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blush-600 disabled:opacity-40"
                        >
                          <BellRing className="size-4" /> Notify me
                        </button>
                      </form>
                      {error && <p className="mt-2 text-xs text-blush-600">{error}</p>}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-6 flex items-center gap-1.5 text-xs text-plum-700/55">
            <MapPin className="size-3.5 text-blush-500" />
            {cities.filter((c) => c.status === "live").reduce((n, c) => n + c.localities.length, 0)} localities live across{" "}
            {cities.filter((c) => c.status === "live").length} cities
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-plum-900">{label}</span>
      <span className="relative mt-2 block">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl bg-cream py-3.5 pr-10 pl-4 text-sm font-medium text-plum-900 ring-1 ring-blush-100 focus:ring-2 focus:ring-blush-300 focus:outline-none disabled:opacity-50"
        >
          <option value="">{placeholder}</option>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-plum-300" />
      </span>
    </label>
  );
}
