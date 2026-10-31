"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, BadgeCheck, ChefHat, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Aurora from "@/components/graphics/Aurora";
import { FACES, IMG, LIVE_CITIES, unsplash } from "@/lib/data";

const ease = [0.22, 1, 0.36, 1] as const;
const rise = (delay: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease } });

export default function Hero() {
  return (
    <section className="grain relative overflow-hidden pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-28">
      <Aurora />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.div
            {...rise(0)}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1 pr-3.5 pl-1 text-sm text-plum-700 ring-1 ring-blush-100 backdrop-blur"
          >
            <span className="flex items-center gap-1 rounded-full bg-plum-900 px-2.5 py-0.5 text-xs font-semibold text-white">
              <MapPin className="size-3" /> {LIVE_CITIES.length} cities
            </span>
            Across Andhra Pradesh &amp; Telangana
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="mt-7 font-display text-[clamp(2.75rem,6.6vw,5.4rem)] leading-[1] font-medium tracking-tight text-plum-900"
          >
            A clean home &amp; a <span className="text-gradient italic">warm</span> meal, every day.
          </motion.h1>

          <motion.p {...rise(0.18)} className="mt-7 max-w-xl text-lg leading-relaxed text-plum-700/80 sm:text-xl">
            Verified women maids and home cooks for working women, new mothers, and mothers living on their own. Booked in minutes,
            followed live in the Lasan Family app.
          </motion.p>

          <motion.div {...rise(0.28)} className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/book" className="px-7 py-4 text-base">
              Book a maid or cook
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button href="#how" variant="secondary" className="px-6 py-4 text-base">
              How it works
            </Button>
          </motion.div>

          <motion.div {...rise(0.38)} className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {FACES.slice(0, 4).map((id) => (
                <Image key={id} src={unsplash(id, 96, 96)} alt="" width={44} height={44} className="size-11 rounded-full object-cover ring-[3px] ring-cream" />
              ))}
            </div>
            <p className="max-w-56 text-sm leading-snug text-plum-700/75">
              Every helper is a woman, Aadhaar and police verified, and trained by us.
            </p>
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.1, ease }}
          className="relative mx-auto aspect-[4/5] w-full max-w-[500px]"
        >
          <div className="absolute -inset-[12%] rounded-full bg-gradient-to-br from-blush-200/70 via-lilac-100/60 to-peach-100/70 blur-3xl" />
          <div className="absolute inset-x-[10%] top-[4%] bottom-[8%] overflow-hidden rounded-t-full rounded-b-[2.5rem] shadow-[0_40px_80px_-30px_rgb(77_38_73/0.5)]">
            <Image src={unsplash(IMG.elder, 900)} alt="A woman smiling at home" fill preload sizes="(max-width: 1024px) 80vw, 400px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/35 via-transparent to-transparent" />
          </div>

          <motion.div {...rise(0.6)} className="glass absolute top-[16%] -left-2 flex items-center gap-3 rounded-2xl p-3 pr-5 shadow-xl sm:-left-8">
            <Image src={unsplash(FACES[0], 96, 96)} alt="" width={44} height={44} className="size-11 rounded-xl object-cover" />
            <div>
              <p className="text-sm font-semibold text-plum-900">Padma checked in</p>
              <p className="flex items-center gap-1.5 text-xs text-plum-700/70">
                <span className="size-2 rounded-full bg-sage-600" /> 8:00 AM · on time
              </p>
            </div>
          </motion.div>

          <motion.div {...rise(0.75)} className="glass absolute top-[52%] -right-2 w-52 rounded-2xl p-4 shadow-xl sm:-right-6">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-peach-100">
                <ChefHat className="size-4 text-blush-600" />
              </span>
              <p className="text-xs font-semibold tracking-wide text-plum-700/60 uppercase">Today&apos;s lunch</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-plum-900">Tomato pappu, beans fry &amp; rasam</p>
            <p className="mt-1 text-[11px] text-plum-700/60">Photo shared at 12:30 PM</p>
          </motion.div>

          <motion.div
            {...rise(0.9)}
            className="glass absolute bottom-[2%] left-[6%] flex items-center gap-2.5 rounded-full py-2 pr-4 pl-2 shadow-xl"
          >
            <span className="grid size-8 place-items-center rounded-full bg-sage-100">
              <BadgeCheck className="size-4 text-sage-600" />
            </span>
            <span className="text-sm font-semibold text-plum-900">100% background-verified</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
