"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { CalendarHeart, HandHeart, MessageCircleHeart, UserRoundSearch } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const STEPS = [
  {
    icon: MessageCircleHeart,
    title: "Tell us about her",
    text: "Your routine, diet, language and the chores you need help with. Two minutes, or one call with a coordinator.",
  },
  {
    icon: UserRoundSearch,
    title: "Meet your matches",
    text: "We shortlist 3 verified maids or cooks who fit. See profiles and reviews, and book a free trial visit.",
  },
  {
    icon: CalendarHeart,
    title: "Book in a tap",
    text: "One visit, daily help or a monthly plan. Reschedule anytime, and pay only after each visit.",
  },
  {
    icon: HandHeart,
    title: "Peace of mind, daily",
    text: "Check-ins, meal photos and a note after every visit. Family can follow along from anywhere.",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  return (
    <section id="how" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              From first call to first visit <em className="text-gradient">in a day</em>
            </>
          }
        />

        <div ref={ref} className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute top-2 bottom-2 left-7 w-px bg-blush-100 sm:left-1/2" />
          <motion.div
            style={{ scaleY: progress }}
            className="absolute top-2 bottom-2 left-7 w-px origin-top bg-gradient-to-b from-blush-400 via-plum-500 to-blush-400 sm:left-1/2"
          />

          <ol className="space-y-14">
            {STEPS.map((s, i) => {
              const right = i % 2 === 1;
              return (
                <li key={s.title} className="relative grid items-center gap-6 pl-20 sm:grid-cols-2 sm:gap-16 sm:pl-0">
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="absolute top-0 left-0 z-10 grid size-14 place-items-center rounded-2xl bg-white text-blush-600 shadow-[0_10px_30px_-10px_rgb(212_86_119/0.5)] ring-1 ring-blush-100 sm:left-1/2 sm:-translate-x-1/2"
                  >
                    <s.icon className="size-6" />
                  </motion.span>
                  <Reveal className={right ? "sm:col-start-2" : "sm:text-right"} y={20}>
                    <p className="font-display text-sm text-blush-500 italic">Step {i + 1}</p>
                    <h3 className="mt-1 font-display text-2xl font-medium text-plum-900 sm:text-3xl">{s.title}</h3>
                    <p className="mt-2 leading-relaxed text-plum-700/70">{s.text}</p>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
