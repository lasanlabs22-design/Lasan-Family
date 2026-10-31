"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import clsx from "clsx";
import { SERVICES, formatINR, unsplash, type Category } from "@/lib/data";

const FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All services" },
  { id: "maid", label: "Maids & home help" },
  { id: "cook", label: "Home cooks" },
];

export default function ServicesExplorer() {
  const params = useSearchParams();
  const initial = (params.get("type") as Category | null) ?? "all";
  const [filter, setFilter] = useState<Category | "all">(FILTERS.some((f) => f.id === initial) ? initial : "all");
  const list = filter === "all" ? SERVICES : SERVICES.filter((s) => s.category === filter);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24">
      <div className="sticky top-20 z-30 -mx-6 mb-10 flex justify-start overflow-x-auto px-6 py-3 [scrollbar-width:none] sm:justify-center">
        <div className="glass flex gap-1 rounded-full p-1.5 shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={clsx(
                "relative rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors sm:px-5",
                filter === f.id ? "text-white" : "text-plum-700/70 hover:text-plum-900",
              )}
            >
              {filter === f.id && <motion.span layoutId="svc-filter" className="absolute inset-0 rounded-full bg-plum-900" />}
              <span className="relative">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((s) => (
            <motion.article
              key={s.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-blush-100 transition-shadow hover:shadow-[0_30px_60px_-30px_rgb(77_38_73/0.4)]"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={unsplash(s.image, 800, 500)}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum-900/50 to-transparent" />
                <span className="glass absolute bottom-4 left-4 grid size-11 place-items-center rounded-2xl text-blush-600">
                  <s.icon className="size-5" />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-2xl font-medium text-plum-900">{s.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-plum-700/75">{s.description}</p>
                <ul className="mt-5 grid grid-cols-2 gap-2">
                  {s.includes.map((x) => (
                    <li key={x} className="flex items-center gap-1.5 text-xs text-plum-700">
                      <Check className="size-3.5 shrink-0 text-blush-500" strokeWidth={3} /> {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between pt-6">
                  <p className="text-sm text-plum-700/60">
                    from <span className="text-lg font-semibold text-plum-900">{formatINR(s.price)}</span> / {s.unit}
                  </p>
                  <Link
                    href={`/book?service=${s.id}`}
                    className="group/btn inline-flex items-center gap-1.5 rounded-full bg-plum-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blush-600"
                  >
                    Book <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
