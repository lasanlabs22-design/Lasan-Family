"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BellRing, Check, ChevronDown, MapPin } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { AREAS, CITY, IMG, unsplash } from "@/lib/data";

const OTHER = "My area isn't listed";

// Decorative "helpers nearby" pins, positioned over the city photo.
const PINS = [
  { x: "22%", y: "48%", d: 0 },
  { x: "38%", y: "62%", d: 0.6 },
  { x: "55%", y: "52%", d: 1.2 },
  { x: "68%", y: "66%", d: 0.3 },
  { x: "80%", y: "50%", d: 0.9 },
  { x: "46%", y: "74%", d: 1.5 },
];

export default function ServiceArea() {
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [joined, setJoined] = useState(false);
  const covered = area !== "" && area !== OTHER;

  return (
    <section id="tirupati" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_1fr]">
        <Reveal className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] shadow-[0_40px_80px_-40px_rgb(77_38_73/0.5)]">
            <Image src={unsplash(IMG.tirupatiCity, 1200)} alt={`Aerial view of ${CITY.name} with the Seshachalam hills`} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/60 via-transparent to-transparent" />
            {PINS.map((p, i) => (
              <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.x, top: p.y }}>
                <motion.span
                  className="absolute inset-0 rounded-full bg-blush-400"
                  animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: p.d, ease: "easeOut" }}
                />
                <span className="relative grid size-4 place-items-center rounded-full bg-white shadow-lg">
                  <span className="size-2 rounded-full bg-blush-500" />
                </span>
              </span>
            ))}
            <div className="glass absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl py-2.5 pr-5 pl-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-blush-500 text-white">
                <MapPin className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-plum-900">
                  {CITY.name}, {CITY.state}
                </p>
                <p className="text-xs text-plum-700/70">{AREAS.length} localities · helpers available today</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-6 -right-4 hidden size-36 rotate-6 overflow-hidden rounded-3xl ring-8 ring-cream sm:block">
            <Image src={unsplash(IMG.tirumalaTemple, 300, 300)} alt="Tirumala temple gopuram" fill sizes="144px" className="object-cover" />
          </div>
        </Reveal>

        <div>
          <SectionHeading
            align="left"
            eyebrow="Where we serve"
            title={
              <>
                Proudly <em className="text-gradient">Tirupati-first</em>
              </>
            }
            text="We're starting close to home, so every helper is local, speaks Telugu and can reach Amma's door on time. Check if we serve her area."
          />

          <Reveal delay={0.1} className="mt-8 rounded-[2rem] bg-white p-6 ring-1 ring-blush-100">
            <label htmlFor="area" className="text-sm font-semibold text-plum-900">
              Her locality in {CITY.name}
            </label>
            <div className="relative mt-2">
              <MapPin className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-blush-500" />
              <select
                id="area"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  setJoined(false);
                }}
                className="w-full appearance-none rounded-2xl bg-cream py-3.5 pr-10 pl-11 text-sm font-medium text-plum-900 ring-1 ring-blush-100 focus:ring-2 focus:ring-blush-300 focus:outline-none"
              >
                <option value="">Choose a locality</option>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
                <option>{OTHER}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-plum-300" />
            </div>

            <AnimatePresence mode="wait">
              {covered && (
                <motion.div
                  key="yes"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-sage-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-start gap-2 text-sm text-plum-700">
                      <Check className="mt-0.5 size-4 shrink-0 text-sage-600" strokeWidth={3} />
                      <span>
                        <span className="font-semibold text-plum-900">Yes, we serve {area}!</span> First visit as early as tomorrow morning.
                      </span>
                    </p>
                    <Link
                      href={`/book?area=${encodeURIComponent(area)}`}
                      className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-plum-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blush-600"
                    >
                      Book now <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.div>
              )}
              {area === OTHER && (
                <motion.div
                  key="no"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-2xl bg-peach-100/70 p-4">
                    {joined ? (
                      <p className="flex items-center gap-2 text-sm font-medium text-plum-900">
                        <Check className="size-4 text-sage-600" strokeWidth={3} /> You&apos;re on the list. We&apos;ll message you on WhatsApp when we reach you.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-plum-700">
                          We&apos;re not there yet, but we&apos;re growing fast. Leave your number and we&apos;ll WhatsApp you first.
                        </p>
                        <form
                          className="mt-3 flex gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (phone.trim().length >= 10) setJoined(true);
                          }}
                        >
                          <label htmlFor="waitlist-phone" className="sr-only">
                            WhatsApp number
                          </label>
                          <input
                            id="waitlist-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 WhatsApp number"
                            className="min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 text-sm text-plum-900 ring-1 ring-blush-100 focus:ring-2 focus:ring-blush-300 focus:outline-none"
                          />
                          <button className="flex shrink-0 items-center gap-1.5 rounded-full bg-plum-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blush-600">
                            <BellRing className="size-4" /> Notify me
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>

          <Reveal delay={0.2} className="mt-6 flex flex-wrap gap-2">
            {AREAS.map((a) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-plum-700 ring-1 ring-blush-100 transition-colors hover:bg-blush-50 hover:ring-blush-300"
              >
                {a}
              </button>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
