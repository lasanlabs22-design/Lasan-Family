"use client";

import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { Coffee, Moon, Shirt, Soup, Sparkles, UtensilsCrossed } from "lucide-react";
import clsx from "clsx";
import { DAY } from "@/lib/data";

const ICONS = [Sparkles, Coffee, Shirt, Soup, UtensilsCrossed, Moon];
const TONES = ["bg-lilac-100", "bg-peach-100", "bg-blush-100", "bg-peach-100", "bg-sage-100", "bg-blush-200"];

function Card({ i }: { i: number }) {
  const m = DAY[i];
  const Icon = ICONS[i];
  return (
    <article className={clsx("relative flex h-full w-[78vw] shrink-0 flex-col rounded-[2rem] p-7 sm:w-[340px] lg:w-[380px]", TONES[i])}>
      <div className="flex items-center justify-between">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/80 text-blush-600">
          <Icon className="size-5" />
        </span>
        <span className="font-display text-6xl leading-none text-plum-900/10">{String(i + 1).padStart(2, "0")}</span>
      </div>
      <p className="mt-10 text-xs font-semibold tracking-[0.16em] text-blush-600 uppercase">{m.when}</p>
      <h3 className="mt-2 font-display text-3xl font-medium text-plum-900">{m.title}</h3>
      <p className="mt-3 leading-relaxed text-plum-700/75">{m.text}</p>
      <span className="mt-auto pt-8 text-xs font-semibold text-plum-700/50 uppercase">{m.category === "maid" ? "Maid" : "Cook"}</span>
    </article>
  );
}

export default function Journey() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const distance = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * distance.get());
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (track.current) distance.set(Math.max(0, track.current.scrollWidth - window.innerWidth + 48));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [distance]);

  const intro = (
    <div className="w-[78vw] shrink-0 pr-6 sm:w-[420px]">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1 text-xs font-semibold tracking-[0.14em] text-blush-200 uppercase">
        <span className="size-1.5 rounded-full bg-blush-300" /> A day with Lasan Family
      </span>
      <h2 className="mt-5 font-display text-4xl leading-[1.05] font-medium text-white sm:text-5xl">
        Her day, <em className="text-blush-300">gently taken care of</em>
      </h2>
      <p className="mt-5 text-lg text-white/65">
        From the morning sweep to the last cup of filter coffee, your maid and cook follow your rhythm, not the other way round.
      </p>
    </div>
  );

  return (
    <>
      {/* Desktop: pinned horizontal scroll */}
      <section ref={ref} className="relative hidden h-[300vh] bg-plum-900 lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="pointer-events-none absolute top-1/4 -left-40 size-[40rem] rounded-full bg-blush-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 size-[30rem] rounded-full bg-lilac-300/15 blur-3xl" />
          <motion.div
            ref={track}
            style={{ x }}
            className="relative flex h-[440px] w-max items-center gap-6 pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
          >
            {intro}
            {DAY.map((_, i) => (
              <Card key={i} i={i} />
            ))}
          </motion.div>
          <div className="relative mx-auto mt-14 h-1 w-full max-w-md overflow-hidden rounded-full bg-white/10">
            <motion.div style={{ width: bar }} className="h-full rounded-full bg-gradient-to-r from-blush-300 to-lilac-300" />
          </div>
        </div>
      </section>

      {/* Mobile & tablet: swipeable rail */}
      <section className="relative overflow-hidden bg-plum-900 py-20 lg:hidden">
        <div className="px-6">{intro}</div>
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none]">
          {DAY.map((_, i) => (
            <div key={i} className="snap-start">
              <Card i={i} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
