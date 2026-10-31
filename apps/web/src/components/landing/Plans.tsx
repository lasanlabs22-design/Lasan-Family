import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import clsx from "clsx";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { PLANS, formatINR } from "@/lib/data";

export default function Plans() {
  return (
    <section id="plans" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Care plans"
          title={
            <>
              Simple plans, <em className="text-gradient">no surprises</em>
            </>
          }
          text="Bundle the help you need and save up to 25% compared with booking visit by visit. Pause or cancel anytime."
        />

        <div className="mt-16 grid items-stretch gap-5 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1} className={clsx(p.featured && "lg:-my-4")}>
              <div
                className={clsx(
                  "relative flex h-full flex-col overflow-hidden rounded-[2.25rem] p-8",
                  p.featured ? "bg-plum-900 text-white shadow-[0_40px_80px_-30px_rgb(42_20_40/0.7)]" : "bg-white ring-1 ring-blush-100",
                )}
              >
                {p.featured && (
                  <>
                    <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-blush-500/40 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-20 size-64 rounded-full bg-lilac-300/25 blur-3xl" />
                    <span className="absolute top-7 right-7 flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-blush-100">
                      <Sparkles className="size-3.5" /> Most loved
                    </span>
                  </>
                )}
                <div className="relative">
                  <p className={clsx("text-xs font-semibold tracking-widest uppercase", p.featured ? "text-blush-200" : "text-blush-600")}>{p.tag}</p>
                  <h3 className="mt-3 font-display text-4xl font-medium">{p.name}</h3>
                  <p className={clsx("mt-2", p.featured ? "text-white/70" : "text-plum-700/70")}>{p.tagline}</p>
                  <p className="mt-8 font-display text-5xl font-medium">
                    {formatINR(p.price)}
                    <span className={clsx("ml-1 font-sans text-base font-normal", p.featured ? "text-white/60" : "text-plum-700/60")}>/ {p.period}</span>
                  </p>
                </div>
                <ul className="relative mt-8 space-y-3.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span className={clsx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", p.featured ? "bg-blush-500" : "bg-blush-100")}>
                        <Check className={clsx("size-3", p.featured ? "text-white" : "text-blush-600")} strokeWidth={3} />
                      </span>
                      <span className={p.featured ? "text-white/85" : "text-plum-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/book?plan=${p.id}`}
                  className={clsx(
                    "group relative mt-auto flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold transition-colors",
                    "mt-10",
                    p.featured ? "bg-white text-plum-900 hover:bg-blush-100" : "bg-plum-900 text-white hover:bg-blush-600",
                  )}
                >
                  Choose {p.name}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
