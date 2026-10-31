import { Quote } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { TESTIMONIALS } from "@/lib/data";

const TONES = ["bg-white", "bg-blush-50", "bg-lilac-100/60", "bg-peach-100/70", "bg-sage-100/70", "bg-white"];

function Row({ items, reverse }: { items: typeof TESTIMONIALS; reverse?: boolean }) {
  return (
    <div className="mask-fade-x flex overflow-hidden">
      <ul
        className={`flex w-max gap-5 pr-5 [--marquee-duration:60s] hover:[animation-play-state:paused] ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {[...items, ...items].map((t, i) => (
          <li
            key={i}
            aria-hidden={i >= items.length}
            className={`w-[340px] shrink-0 rounded-[2rem] p-7 ring-1 ring-blush-100 sm:w-[400px] ${TONES[i % TONES.length]}`}
          >
            <Quote className="size-7 fill-blush-200 text-blush-200" />
            <p className="mt-4 font-display text-lg leading-relaxed text-plum-900">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-blush-300 to-plum-500 text-sm font-semibold text-white">
                {t.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-semibold text-plum-900">{t.name}</p>
                <p className="text-xs text-plum-700/60">{t.context}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-cream via-blush-50 to-cream py-24 sm:py-32">
      <div className="px-6">
        <SectionHeading
          eyebrow="Stories"
          title={
            <>
              Heard at <em className="text-gradient">kitchen tables</em> everywhere
            </>
          }
        />
      </div>
      <div className="mt-14 space-y-5">
        <Row items={TESTIMONIALS.slice(0, 3)} />
        <Row items={TESTIMONIALS.slice(3)} reverse />
      </div>
    </section>
  );
}
