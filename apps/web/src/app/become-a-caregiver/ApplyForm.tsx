"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Send } from "lucide-react";
import clsx from "clsx";
import { AREAS, CITY, SERVICES } from "@/lib/data";

const input =
  "mt-2 w-full rounded-2xl bg-cream px-4 py-3 text-sm text-plum-900 ring-1 ring-blush-100 placeholder:text-plum-700/40 focus:ring-2 focus:ring-blush-300 focus:outline-none";

export default function ApplyForm() {
  const [skills, setSkills] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-[2.25rem] bg-white p-7 shadow-[0_40px_80px_-40px_rgb(77_38_73/0.35)] ring-1 ring-blush-100 sm:p-9">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-sage-100 text-sage-600">
              <Check className="size-9" strokeWidth={3} />
            </span>
            <h3 className="mt-6 font-display text-3xl text-plum-900">Application received</h3>
            <p className="mt-2 text-plum-700/70">Our team will call you within 2 working days. Welcome to the Nestly family!</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0, scale: 0.97 }}
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <h3 className="font-display text-3xl font-medium text-plum-900">Apply now</h3>
            <p className="mt-1 text-sm text-plum-700/60">Takes less than 5 minutes.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-plum-900">Full name</span>
                <input required className={input} placeholder="e.g. Padmavathi" />
              </label>
              <label>
                <span className="text-sm font-semibold text-plum-900">Phone</span>
                <input required type="tel" className={input} placeholder="+91" />
              </label>
              <label>
                <span className="text-sm font-semibold text-plum-900">Where in {CITY.name}?</span>
                <select required className={input} defaultValue="">
                  <option value="" disabled>
                    Your locality
                  </option>
                  {AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                  <option>Nearby village / town</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-semibold text-plum-900">Years of experience</span>
                <select className={input} defaultValue="1-3">
                  <option value="0">New to care</option>
                  <option value="1-3">1–3 years</option>
                  <option value="3-7">3–7 years</option>
                  <option value="7+">7+ years</option>
                </select>
              </label>
            </div>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-plum-900">What can you offer?</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {SERVICES.map((s) => {
                  const on = skills.includes(s.id);
                  return (
                    <button
                      type="button"
                      key={s.id}
                      aria-pressed={on}
                      onClick={() => setSkills((k) => (on ? k.filter((x) => x !== s.id) : [...k, s.id]))}
                      className={clsx(
                        "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ring-1 transition-all",
                        on ? "bg-plum-900 text-white ring-plum-900" : "text-plum-700 ring-blush-100 hover:ring-blush-300",
                      )}
                    >
                      <s.icon className="size-3.5" />
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <button
              type="submit"
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-plum-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-blush-600"
            >
              Submit application <Send className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
