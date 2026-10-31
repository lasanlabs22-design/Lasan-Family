"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Bell, Camera, ClipboardList, MapPin, Shirt, Siren, Sparkles, Utensils } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { FACES, IMG, unsplash } from "@/lib/data";

const FEED = [
  { icon: MapPin, time: "8:00 AM", title: "Padma checked in", sub: "Verified at home · on time", tone: "bg-sage-100 text-sage-600" },
  { icon: Sparkles, time: "8:40 AM", title: "House swept & mopped", sub: "Bedroom, hall & balcony", tone: "bg-lilac-100 text-plum-500" },
  { icon: Utensils, time: "9:00 AM", title: "Breakfast served", sub: "Pesarattu, ginger chutney & filter coffee", tone: "bg-peach-100 text-blush-600", photo: IMG.dosa },
  { icon: Shirt, time: "10:30 AM", title: "Laundry done", sub: "Washed, dried & 2 sarees ironed", tone: "bg-blush-100 text-blush-600" },
  { icon: Utensils, time: "12:30 PM", title: "Lunch cooked by Lakshmi", sub: "Tomato pappu, beans fry & rasam", tone: "bg-peach-100 text-blush-600", photo: IMG.thali },
  { icon: Sparkles, time: "1:15 PM", title: "Kitchen cleaned", sub: "Dishes done · gas checked off", tone: "bg-sage-100 text-sage-600" },
];

const FEATURES = [
  { icon: Bell, title: "Live check-ins", text: "Know the moment help arrives and leaves." },
  { icon: Camera, title: "Meal photos", text: "See every meal as it is served." },
  { icon: ClipboardList, title: "Menu & chores", text: "Plan the week's menu and chore list together." },
  { icon: Siren, title: "One-tap help", text: "Alerts family and your coordinator instantly." },
];

const STATS = [
  { value: 6, suffix: "", label: "cities live across AP & Telangana" },
  { value: 100, suffix: "%", label: "women helpers" },
  { value: 100, suffix: "%", label: "Aadhaar & police verified" },
  { value: 24, suffix: " hrs", label: "to your first visit", prefix: "<" },
];

function Counter({ value, suffix, prefix = "", decimals = 0 }: { value: number; suffix: string; prefix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1800);
      setN(value * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

function Phone() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const [count, setCount] = useState(2);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setCount((c) => (c >= FEED.length ? 2 : c + 1)), 2200);
    return () => clearInterval(id);
  }, [inView]);

  const visible = FEED.slice(0, count).reverse().slice(0, 4);
  const cg = { name: "Padma", image: FACES[0] };

  return (
    <div ref={ref} className="relative mx-auto w-[300px] sm:w-[330px]">
      <div className="absolute -inset-10 rounded-full bg-gradient-to-br from-blush-300/50 via-lilac-300/40 to-peach-300/50 blur-3xl" />
      <div className="relative rounded-[3rem] bg-plum-900 p-3 shadow-[0_50px_100px_-30px_rgb(42_20_40/0.6)] ring-1 ring-white/10">
        <div className="relative h-[620px] overflow-hidden rounded-[2.4rem] bg-cream">
          <div className="absolute top-2.5 left-1/2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-plum-900" />
          <div className="bg-gradient-to-br from-blush-200 via-blush-100 to-lilac-100 px-5 pt-12 pb-6">
            <p className="text-xs font-medium text-plum-700/70">Good morning, Srinivas</p>
            <p className="mt-0.5 font-display text-xl font-medium text-plum-900">Amma&apos;s day so far</p>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur">
              <Image src={unsplash(cg.image, 96, 96)} alt="" width={40} height={40} className="size-10 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-plum-900">{cg.name} is with Amma</p>
                <p className="text-[11px] text-plum-700/60">Since 8:00 AM · until 11:30 AM</p>
              </div>
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-sage-600 opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-sage-600" />
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["Chores", "5/6"],
                ["Meals", "2/3"],
                ["Mood", "Happy"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/60 py-2">
                  <p className="text-[10px] text-plum-700/60 uppercase">{k}</p>
                  <p className="text-sm font-semibold text-plum-900">{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 pt-4">
            <p className="px-1 text-[11px] font-semibold tracking-wider text-plum-700/50 uppercase">Live timeline</p>
            <ul className="mt-2 space-y-2">
              <AnimatePresence initial={false}>
                {visible.map((f) => (
                  <motion.li
                    key={f.title + f.time}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-blush-50"
                  >
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${f.tone}`}>
                      <f.icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-plum-900">{f.title}</p>
                      <p className="truncate text-[11px] text-plum-700/60">{f.sub}</p>
                    </div>
                    {f.photo ? (
                      <Image src={unsplash(f.photo, 96, 96)} alt="" width={36} height={36} className="size-9 rounded-lg object-cover" />
                    ) : (
                      <span className="text-[10px] text-plum-700/50">{f.time}</span>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <div className="absolute inset-x-4 bottom-4 flex gap-2">
            <button className="flex-1 rounded-2xl bg-plum-900 py-3 text-xs font-semibold text-white">Video call Amma</button>
            <button className="grid w-14 place-items-center rounded-2xl bg-blush-500 text-white" aria-label="SOS">
              <Siren className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FamilyApp() {
  return (
    <section className="relative overflow-hidden bg-ivory py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <Reveal>
            <Phone />
          </Reveal>
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="The Lasan Family app"
            title={
              <>
                Miles away, <em className="text-gradient">never far</em>
              </>
            }
            text="For your own home, or your mother&apos;s across the state. See when the helper arrives, what was cooked and what got done, in one calm timeline."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={0.08 * i} className="rounded-3xl bg-white p-5 ring-1 ring-blush-100">
                <span className="grid size-10 place-items-center rounded-xl bg-blush-50 text-blush-600">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-3 font-semibold text-plum-900">{f.title}</h3>
                <p className="mt-1 text-sm text-plum-700/70">{f.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3} className="mt-8">
            <Button href="/dashboard">Preview the app</Button>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] bg-blush-100 ring-1 ring-blush-100 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-ivory p-8 text-center">
              <p className="font-display text-4xl font-medium text-plum-900 sm:text-5xl">
                <Counter {...s} />
              </p>
              <p className="mt-2 text-sm text-plum-700/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
