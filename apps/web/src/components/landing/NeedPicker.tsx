"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import clsx from "clsx";
import SectionHeading from "@/components/ui/SectionHeading";
import { NEEDS, PLANS, SERVICES, formatINR, unsplash, type Need } from "@/lib/data";

const PLAN_FOR = { maid: "tidy", cook: "nourish", both: "complete" } as const;
const SERVICES_FOR: Record<Need, string[]> = {
  maid: ["daily-maid", "laundry", "deep-cleaning", "live-in-maid"],
  cook: ["daily-cook", "diet-cook", "occasion-cook"],
  both: ["daily-maid", "daily-cook", "laundry", "diet-cook"],
};

export default function NeedPicker() {
  const [active, setActive] = useState<Need>("maid");
  const need = NEEDS.find((s) => s.id === active)!;
  const services = SERVICES_FOR[active].map((id) => SERVICES.find((s) => s.id === id)!);
  const plan = PLANS.find((p) => p.id === PLAN_FOR[active])!;

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Two things, done beautifully"
          title={
            <>
              Housework and cooking, <em className="text-gradient">off her hands</em>
            </>
          }
          text="Pick what she needs and we'll match a verified helper who fits her routine, her language and her taste."
        />

        <div role="tablist" aria-label="What she needs" className="mx-auto mt-12 flex w-fit flex-wrap justify-center gap-1 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-blush-100">
          {NEEDS.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={active === s.id}
              onClick={() => setActive(s.id)}
              className={clsx(
                "relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:px-7",
                active === s.id ? "text-white" : "text-plum-700/70 hover:text-plum-900",
              )}
            >
              {active === s.id && (
                <motion.span layoutId="need-pill" className="absolute inset-0 rounded-full bg-plum-900" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <span className="relative">{s.label}</span>
            </button>
          ))}
        </div>

        <div className={clsx("mt-10 overflow-hidden rounded-[2.5rem] bg-gradient-to-br p-3 transition-colors duration-700 sm:p-4", need.tint)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-4 lg:grid-cols-[1fr_1.15fr]"
            >
              <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] lg:min-h-[520px]">
                <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
                  <Image src={unsplash(need.image, 1000)} alt="" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-plum-900/80 via-plum-900/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                  <p className="text-sm font-semibold tracking-widest text-blush-200 uppercase">{need.short}</p>
                  <p className="mt-3 max-w-md font-display text-2xl leading-snug sm:text-3xl">{need.blurb}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {services.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}>
                      <Link
                        href={`/book?service=${s.id}`}
                        className="group flex h-full flex-col rounded-3xl bg-white/85 p-5 ring-1 ring-white transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_40px_-20px_rgb(77_38_73/0.35)]"
                      >
                        <span className="grid size-11 place-items-center rounded-2xl bg-blush-50 text-blush-600 transition-colors group-hover:bg-blush-500 group-hover:text-white">
                          <s.icon className="size-5" />
                        </span>
                        <h3 className="mt-4 font-semibold text-plum-900">{s.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-plum-700/70">{s.short}</p>
                        <p className="mt-auto pt-4 text-sm text-plum-700/60">
                          from <span className="font-semibold text-plum-900">{formatINR(s.price)}</span> / {s.unit}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="relative flex flex-1 flex-col justify-between gap-5 overflow-hidden rounded-3xl bg-plum-900 p-6 text-white sm:flex-row sm:items-center sm:p-7">
                  <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-blush-500/40 blur-3xl" />
                  <div className="relative">
                    <p className="text-xs font-semibold tracking-widest text-blush-200 uppercase">Suggested plan · {plan.name}</p>
                    <p className="mt-2 font-display text-3xl">
                      {formatINR(plan.price)}
                      <span className="text-base text-white/60"> / {plan.period}</span>
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/75">
                      {plan.features.slice(0, 3).map((f) => (
                        <li key={f} className="flex items-center gap-1.5">
                          <Check className="size-3.5 text-blush-300" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={`/book?plan=${plan.id}`}
                    className="group relative inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-semibold text-plum-900 transition-colors hover:bg-blush-100 sm:self-auto"
                  >
                    Start {plan.name}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
