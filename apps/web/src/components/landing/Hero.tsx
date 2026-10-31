"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, BadgeCheck, ChefHat, MapPin, Play, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Aurora from "@/components/graphics/Aurora";
import OrbLazy from "@/components/graphics/OrbLazy";
import { CAREGIVERS, IMG, unsplash } from "@/lib/data";

const ease = [0.22, 1, 0.36, 1] as const;
const words = ["A", "clean", "home", "&", "a"];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  return (
    <section ref={ref} className="grain relative overflow-hidden pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-28">
      <Aurora />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1 pr-3.5 pl-1 text-sm text-plum-700 ring-1 ring-blush-100 backdrop-blur"
          >
            <span className="flex items-center gap-1 rounded-full bg-blush-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              <MapPin className="size-3" /> Now live
            </span>
            Serving homes across Tirupati
          </motion.div>

          <h1 className="mt-7 font-display text-[clamp(2.75rem,7vw,5.6rem)] leading-[0.98] font-medium tracking-tight text-plum-900">
            {words.map((w, i) => (
              <motion.span
                key={w}
                className="mr-[0.22em] inline-block"
                initial={{ opacity: 0, y: 40, rotate: 4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease }}
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              className="relative inline-block italic"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45, ease }}
            >
              <span className="text-gradient">warm</span>
              <svg viewBox="0 0 300 20" className="absolute -bottom-2 left-0 w-full" aria-hidden>
                <motion.path
                  d="M4 14 C 80 4, 200 4, 296 12"
                  fill="none"
                  stroke="var(--color-blush-300)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 1, ease }}
                />
              </svg>
            </motion.span>{" "}
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease }}
            >
              meal, every day.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-plum-700/80 sm:text-xl"
          >
            Trusted maids and home cooks for elderly women in Tirupati. Telugu-speaking women who keep the home spotless and the meals
            fresh, just the way she likes them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button href="/book" className="px-7 py-4 text-base">
              Book a maid or cook
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button href="#how" variant="secondary" className="px-6 py-4 text-base">
              <span className="grid size-7 place-items-center rounded-full bg-blush-100">
                <Play className="size-3 fill-blush-600 text-blush-600" />
              </span>
              How it works
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="mt-10 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {CAREGIVERS.slice(0, 4).map((c) => (
                <Image
                  key={c.id}
                  src={unsplash(c.image, 96, 96)}
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover ring-[3px] ring-cream"
                />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 text-gold-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
                <span className="ml-1 font-semibold text-plum-900">4.9</span>
              </div>
              <p className="text-plum-700/70">Loved by 1,200+ Tirupati families</p>
            </div>
          </motion.div>
        </div>

        {/* Visual */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px]">
          <motion.div style={{ scale: orbScale }} className="absolute -inset-[18%] -z-0">
            <OrbLazy className="relative size-full" />
          </motion.div>

          <motion.div
            style={{ y: imgY }}
            initial={{ opacity: 0, scale: 0.92, clipPath: "inset(30% 30% 30% 30% round 999px)" }}
            animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 999px 999px 40px 40px)" }}
            transition={{ duration: 1.4, delay: 0.2, ease }}
            className="absolute inset-x-[12%] top-[6%] bottom-[8%] overflow-hidden shadow-[0_40px_80px_-30px_rgb(77_38_73/0.55)]"
          >
            <Image
              src={unsplash(IMG.elder, 900)}
              alt="Smiling elderly woman at home"
              fill
              preload
              sizes="(max-width: 1024px) 80vw, 420px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/40 via-transparent to-transparent" />
          </motion.div>

          <motion.div style={{ y: cardY }} className="absolute inset-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 1.1, ease }}
              className="glass animate-float absolute top-[14%] -left-2 flex items-center gap-3 rounded-2xl p-3 pr-5 shadow-xl sm:-left-10"
            >
              <Image
                src={unsplash(CAREGIVERS[1].image, 96, 96)}
                alt=""
                width={44}
                height={44}
                className="size-11 rounded-xl object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-plum-900">Padma is on her way</p>
                <p className="flex items-center gap-1.5 text-xs text-plum-700/70">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-sage-600 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-sage-600" />
                  </span>
                  Arriving in 12 min
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 1.3, ease }}
              className="glass absolute top-[48%] -right-2 w-52 rounded-2xl p-4 shadow-xl [animation-delay:-2s] animate-float sm:-right-8"
            >
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-peach-100">
                  <ChefHat className="size-4 text-blush-600" />
                </span>
                <p className="text-xs font-semibold tracking-wide text-plum-700/60 uppercase">Today&apos;s lunch</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-plum-900">Tomato pappu, beans fry & rasam</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blush-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blush-400 to-plum-500"
                  initial={{ width: 0 }}
                  animate={{ width: "78%" }}
                  transition={{ duration: 1.6, delay: 1.8, ease }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-plum-700/60">Cooking · ready in 15 min</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.5, ease }}
              className="glass absolute bottom-[2%] left-[8%] flex items-center gap-2.5 rounded-full py-2 pr-4 pl-2 shadow-xl"
            >
              <span className="grid size-8 place-items-center rounded-full bg-sage-100">
                <BadgeCheck className="size-4 text-sage-600" />
              </span>
              <span className="text-sm font-semibold text-plum-900">100% background-verified</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
