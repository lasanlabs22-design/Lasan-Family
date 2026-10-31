"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Check, Clock, MapPin, MessageCircle, Minus, Plus, Shirt, Siren, Sparkles, Utensils, Video } from "lucide-react";
import clsx from "clsx";
import { FACES, IMG, unsplash } from "@/lib/data";

// Static preview personas, matching the demo data in the API seed.
const padma = { id: "padma", name: "Padma R.", role: "Daily maid", image: FACES[0] };
const lakshmi = { id: "lakshmi", name: "Lakshmi K.", role: "Home cook · Diet-specific meals", image: FACES[1] };
import { ColumnChart, LineChart, Sparkline, type Point } from "./charts";

// Demo data: 60 deterministic days ending 30 Oct so the "previous period" deltas have a baseline.
const MONTHS = [
  { name: "Aug", days: 31 },
  { name: "Sep", days: 30 },
  { name: "Oct", days: 31 },
];
function labelFor(daysBack: number) {
  let day = 30 - daysBack;
  let mi = 2;
  while (day < 1) {
    mi -= 1;
    day += MONTHS[mi].days;
  }
  return `${day} ${MONTHS[mi].name}`;
}
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
const r = rng(42);
const DAYS = Array.from({ length: 60 }, (_, i) => {
  const trend = i / 59; // helpers settle into the routine over time
  return {
    label: labelFor(59 - i),
    late: Math.round(9 - trend * 9 + (r() - 0.5) * 14),
    hours: Math.round((4 + r() * 2 + (i % 7 === 6 ? -2 : 0)) * 2) / 2,
    meals: i % 7 === 6 ? 2 : 3,
    chores: Math.min(100, Math.round(84 + trend * 10 + (r() - 0.5) * 12)),
  };
});

const RANGES = [7, 14, 30] as const;

const TODAY = [
  { icon: MapPin, time: "8:00 AM", title: "Padma checked in", done: true },
  { icon: Sparkles, time: "8:40 AM", title: "House swept & mopped", done: true },
  { icon: Utensils, time: "9:00 AM", title: "Breakfast: pesarattu & ginger chutney", done: true },
  { icon: Shirt, time: "10:30 AM", title: "Laundry washed & 2 sarees ironed", done: true },
  { icon: Utensils, time: "12:30 PM", title: "Lunch by Lakshmi: tomato pappu, beans fry & rasam", done: true },
  { icon: Sparkles, time: "1:15 PM", title: "Kitchen cleaned · gas checked off", done: false },
  { icon: Utensils, time: "7:00 PM", title: "Dinner: ragi sangati & soft chapati", done: false },
];

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const onTime = (xs: { late: number }[]) => Math.round((xs.filter((d) => d.late <= 10).length / xs.length) * 100);

export default function FamilyDashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(14);
  const [tableView, setTableView] = useState(false);

  const s = useMemo(() => {
    const cur = DAYS.slice(-range);
    const prev = DAYS.slice(-range * 2, -range);
    return {
      late: cur.map((d) => ({ label: d.label, value: d.late })) as Point[],
      hours: cur.map((d) => ({ label: d.label, value: d.hours })) as Point[],
      totalHours: cur.reduce((a, d) => a + d.hours, 0),
      prevHours: prev.reduce((a, d) => a + d.hours, 0),
      onTime: onTime(cur),
      prevOnTime: onTime(prev),
      meals: cur.reduce((a, d) => a + d.meals, 0),
      prevMeals: prev.reduce((a, d) => a + d.meals, 0),
      chores: Math.round(avg(cur.map((d) => d.chores))),
      prevChores: Math.round(avg(prev.map((d) => d.chores))),
      sparkLate: cur.slice(-12).map((d) => -d.late),
      sparkMeals: cur.slice(-12).map((d) => d.meals),
      sparkChores: cur.slice(-12).map((d) => d.chores),
    };
  }, [range]);

  const tiles = [
    { label: "On-time arrivals", value: `${s.onTime}%`, unit: "", delta: s.onTime - s.prevOnTime, deltaUnit: " pts", spark: s.sparkLate },
    { label: "Meals cooked", value: `${s.meals}`, unit: "", delta: s.meals - s.prevMeals, spark: s.sparkMeals },
    { label: "Chores completed", value: `${s.chores}%`, unit: "", delta: s.chores - s.prevChores, deltaUnit: " pts", spark: s.sparkChores },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-blush-200 via-blush-100 to-lilac-100 p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-24 right-10 size-72 rounded-full bg-white/50 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Image src={unsplash(IMG.elderYellow, 200, 200)} alt="Saroja Devi" width={84} height={84} className="size-20 rounded-3xl object-cover ring-4 ring-white sm:size-21" />
              <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-sage-600 ring-4 ring-blush-100">
                <Check className="size-3.5 text-white" strokeWidth={3} />
              </span>
            </div>
            <div>
              <p className="text-sm text-plum-700/70">Good afternoon, Srinivas · Thursday, 30 Oct</p>
              <h1 className="font-display text-3xl font-medium text-plum-900 sm:text-4xl">Amma&apos;s home is in good hands</h1>
              <p className="mt-1 text-sm text-plum-700/70">Saroja Devi, 74 · Complete plan · Korlagunta, Tirupati</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/80 py-2 pr-4 pl-2 backdrop-blur">
              <Image src={unsplash(padma.image, 96, 96)} alt="" width={40} height={40} className="size-10 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-semibold text-plum-900">{padma.name} is at home</p>
                <p className="flex items-center gap-1.5 text-xs text-plum-700/60">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-sage-600 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-sage-600" />
                  </span>
                  On shift until 2:00 PM
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-full bg-plum-900 px-5 py-3 text-sm font-semibold text-white hover:bg-plum-700">
              <Video className="size-4" /> Call Amma
            </button>
            <button className="flex items-center gap-2 rounded-full bg-blush-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blush-600">
              <Siren className="size-4" /> Help
            </button>
          </div>
        </div>
      </div>

      {/* Filter row: scopes every stat and chart below */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-blush-100" role="group" aria-label="Date range">
          {RANGES.map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              aria-pressed={range === d}
              className={clsx("relative rounded-full px-4 py-2 text-sm font-semibold transition-colors", range === d ? "text-white" : "text-plum-700/70 hover:text-plum-900")}
            >
              {range === d && <motion.span layoutId="range" className="absolute inset-0 rounded-full bg-plum-900" />}
              <span className="relative">Last {d} days</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setTableView((t) => !t)}
          aria-pressed={tableView}
          className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-plum-700 ring-1 ring-blush-100 hover:ring-blush-300"
        >
          {tableView ? "Show charts" : "Show as table"}
        </button>
      </div>

      {/* Stats */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-plum-900 p-6 text-white">
          <div className="pointer-events-none absolute -right-10 -bottom-16 size-44 rounded-full bg-blush-500/40 blur-3xl" />
          <p className="relative text-sm text-white/70">Hours of help at home</p>
          <p className="relative mt-2 text-5xl font-semibold tracking-tight">{s.totalHours}</p>
          <p className="relative mt-2 flex items-center gap-1 text-sm text-white/70">
            {s.totalHours >= s.prevHours ? <ArrowUpRight className="size-4 text-sage-300" /> : <ArrowDownRight className="size-4 text-blush-300" />}
            {s.totalHours >= s.prevHours ? "+" : ""}
            {s.totalHours - s.prevHours} vs previous {range} days
          </p>
        </div>
        {tiles.map((t) => {
          const good = t.delta >= 0;
          const Arrow = t.delta < 0 ? ArrowDownRight : t.delta > 0 ? ArrowUpRight : Minus;
          return (
            <div key={t.label} className="rounded-[1.75rem] bg-white p-6 ring-1 ring-blush-100">
              <p className="text-sm text-plum-700/70">{t.label}</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <p className="text-3xl font-semibold tracking-tight text-plum-900">{t.value}</p>
                <Sparkline values={t.spark} />
              </div>
              <p
                className={clsx(
                  "mt-2 flex items-center gap-1 text-sm font-medium",
                  t.delta === 0 ? "text-plum-700/60" : good ? "text-sage-600" : "text-blush-600",
                )}
              >
                <Arrow className="size-4" />
                {t.delta === 0 ? "No change" : `${t.delta > 0 ? "+" : ""}${t.delta.toLocaleString("en-IN")}${t.deltaUnit ?? ""}`}
                <span className="font-normal text-plum-700/60">· vs previous {range} days</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-blush-100">
          <h2 className="font-semibold text-plum-900">Arrival time vs schedule</h2>
          <p className="text-sm text-plum-700/60">Minutes after the booked start time (below 0 means early)</p>
          <div className="mt-5">
            {tableView ? (
              <DataTable rows={s.late} unit="min late" />
            ) : (
              <LineChart data={s.late} domain={[-10, 25]} ticks={[-10, 0, 10, 20]} unit="min" band={[-10, 10]} bandLabel="On-time window" />
            )}
          </div>
        </section>
        <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-blush-100">
          <h2 className="font-semibold text-plum-900">Hours of help per day</h2>
          <p className="text-sm text-plum-700/60">Maid and cook combined, from check-ins</p>
          <div className="mt-5">{tableView ? <DataTable rows={s.hours} unit="hrs" /> : <ColumnChart data={s.hours} unit="hrs" ticks={[0, 2, 4, 6]} />}</div>
        </section>
      </div>

      {/* Day + team */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-blush-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-plum-900">Today at home</h2>
            <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-600">5 of 7 done</span>
          </div>
          <ol className="relative mt-6 space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-px before:bg-blush-100">
            {TODAY.map((t, i) => (
              <motion.li key={t.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative flex items-center gap-4">
                <span className={clsx("relative z-10 grid size-10 shrink-0 place-items-center rounded-xl ring-4 ring-white", t.done ? "bg-blush-50 text-blush-600" : "bg-cream text-plum-300")}>
                  <t.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={clsx("text-sm font-medium", t.done ? "text-plum-900" : "text-plum-700/60")}>{t.title}</p>
                  <p className="text-xs text-plum-700/50">{t.time}</p>
                </div>
                {t.done ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-sage-600">
                    <Check className="size-3.5" strokeWidth={3} /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-plum-700/50">
                    <Clock className="size-3.5" /> Upcoming
                  </span>
                )}
              </motion.li>
            ))}
          </ol>
        </section>

        <div className="space-y-4">
          <section className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-blush-100">
            <div className="relative h-36">
              <Image src={unsplash(IMG.bananaLeafMeal, 700, 300)} alt="Today's lunch" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-900/70 to-transparent" />
              <p className="absolute bottom-3 left-4 text-sm font-semibold text-white">Lunch photo from Lakshmi · 12:30 PM</p>
            </div>
            <div className="flex items-start gap-3 p-5">
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-blush-500" />
              <p className="text-sm text-plum-700">&ldquo;Amma loved the beans fry and asked for it again on Friday. Less salt, as always.&rdquo;</p>
            </div>
          </section>

          <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-blush-100">
            <h2 className="font-semibold text-plum-900">Her helpers</h2>
            <ul className="mt-4 space-y-3">
              {[padma, lakshmi].map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <Image src={unsplash(c.image, 96, 96)} alt="" width={44} height={44} className="size-11 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-plum-900">{c.name}</p>
                    <p className="text-xs text-plum-700/60">{c.role}</p>
                  </div>
                  <button aria-label={`Message ${c.name}`} className="grid size-9 place-items-center rounded-full bg-blush-50 text-blush-600 hover:bg-blush-100">
                    <MessageCircle className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Link
              href="/book?service=deep-cleaning"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-cream py-3 text-sm font-semibold text-plum-900 ring-1 ring-blush-100 hover:bg-blush-50"
            >
              <Plus className="size-4" /> Book a deep clean
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function DataTable({ rows, unit }: { rows: Point[]; unit: string }) {
  return (
    <div className="max-h-[240px] overflow-auto rounded-xl ring-1 ring-blush-100">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-cream text-left text-plum-700/70">
          <tr>
            <th className="px-4 py-2 font-medium">Date</th>
            <th className="px-4 py-2 text-right font-medium">Value ({unit})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blush-50">
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="px-4 py-2 text-plum-700">{r.label}</td>
              <td className="px-4 py-2 text-right font-medium text-plum-900 tabular-nums">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
