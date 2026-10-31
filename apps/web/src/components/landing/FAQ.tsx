"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import clsx from "clsx";
import SectionHeading from "@/components/ui/SectionHeading";
import { FAQS } from "@/lib/data";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-ivory py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading
          align="left"
          eyebrow="Questions"
          title={
            <>
              Everything you&apos;d <em className="text-gradient">want to ask</em>
            </>
          }
          text="Still unsure? Our care managers are a call away, 7 days a week."
          className="lg:sticky lg:top-32 lg:self-start"
        />
        <ul className="divide-y divide-blush-100 border-y border-blush-100">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-xl font-medium text-plum-900 sm:text-2xl">{f.q}</span>
                  <span
                    className={clsx(
                      "grid size-10 shrink-0 place-items-center rounded-full transition-all duration-300",
                      isOpen ? "rotate-45 bg-plum-900 text-white" : "bg-blush-50 text-plum-900",
                    )}
                  >
                    <Plus className="size-5" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 leading-relaxed text-plum-700/75">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
