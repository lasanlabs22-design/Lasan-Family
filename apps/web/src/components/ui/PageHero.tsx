import Aurora from "@/components/graphics/Aurora";
import Reveal from "./Reveal";

export default function PageHero({ eyebrow, title, text, children }: { eyebrow: string; title: React.ReactNode; text?: string; children?: React.ReactNode }) {
  return (
    <section className="grain relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-20">
      <Aurora />
      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white/70 px-3.5 py-1 text-xs font-semibold tracking-[0.14em] text-blush-600 uppercase">
            <span className="size-1.5 rounded-full bg-blush-500" />
            {eyebrow}
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] font-medium tracking-tight text-plum-900">{title}</h1>
          {text && <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-plum-700/75">{text}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
