import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import Button from "@/components/ui/Button";
import { SERVICES, formatINR, unsplash } from "@/lib/data";

const LAYOUT: { id: string; span: string; image?: boolean; tone?: string }[] = [
  { id: "daily-maid", span: "sm:col-span-2 lg:row-span-2", image: true },
  { id: "daily-cook", span: "sm:col-span-2", image: true },
  { id: "laundry", span: "", tone: "bg-peach-100" },
  { id: "diet-cook", span: "", tone: "bg-lilac-100" },
  { id: "live-in-maid", span: "sm:col-span-2", image: true },
  { id: "deep-cleaning", span: "", tone: "bg-sage-100" },
  { id: "occasion-cook", span: "", tone: "bg-blush-100" },
];

export default function ServicesBento() {
  return (
    <section className="relative bg-ivory py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            align="left"
            eyebrow="Our services"
            title={
              <>
                The people who make home <em className="text-gradient">feel lighter</em>
              </>
            }
            text="Every maid and cook is hand-picked, trained for respectful in-home work, and backed by our replacement guarantee."
          />
          <Reveal delay={0.1}>
            <Button href="/services" variant="secondary">
              View all services <ArrowUpRight className="size-4" />
            </Button>
          </Reveal>
        </div>

        <div className="mt-14 grid auto-rows-[minmax(230px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LAYOUT.map((l, i) => {
            const s = SERVICES.find((x) => x.id === l.id)!;
            return (
              <Reveal key={s.id} delay={i * 0.06} className={l.span}>
                <TiltCard className="h-full rounded-[2rem]" max={l.image ? 4 : 8}>
                  <Link
                    href={`/book?service=${s.id}`}
                    className={clsx(
                      "relative flex h-full flex-col overflow-hidden rounded-[2rem] p-7",
                      l.image ? "min-h-[280px] justify-end text-white" : clsx(l.tone, "text-plum-900"),
                    )}
                  >
                    {l.image && (
                      <>
                        <Image
                          src={unsplash(s.image, 1000)}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-plum-900/85 via-plum-900/25 to-transparent" />
                      </>
                    )}
                    <span
                      className={clsx(
                        "absolute top-6 right-6 grid size-11 place-items-center rounded-full transition-all duration-300 group-hover:rotate-45",
                        l.image ? "glass text-plum-900" : "bg-white text-plum-900",
                      )}
                    >
                      <ArrowUpRight className="size-5" />
                    </span>
                    <span className={clsx("relative grid size-12 place-items-center rounded-2xl", l.image ? "glass text-blush-600" : "bg-white/80 text-blush-600")}>
                      <s.icon className="size-5" />
                    </span>
                    <div className={clsx("relative", l.image ? "mt-4" : "mt-auto pt-10")}>
                      <h3 className={clsx("font-display font-medium", l.span.includes("row-span-2") ? "text-4xl" : "text-2xl")}>{s.name}</h3>
                      <p className={clsx("mt-2 max-w-sm text-sm leading-relaxed", l.image ? "text-white/80" : "text-plum-700/70")}>{s.short}</p>
                      <p className={clsx("mt-4 text-sm", l.image ? "text-white/70" : "text-plum-700/60")}>
                        from <span className={clsx("font-semibold", l.image ? "text-white" : "text-plum-900")}>{formatINR(s.price)}</span> / {s.unit}
                      </p>
                    </div>
                  </Link>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
