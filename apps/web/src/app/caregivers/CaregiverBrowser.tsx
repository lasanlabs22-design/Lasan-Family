"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, SearchX } from "lucide-react";
import clsx from "clsx";
import CaregiverCard from "@/components/CaregiverCard";
import type { Category, CityDTO, ProviderDTO } from "@/lib/data";

const KIND_FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "maid", label: "Maids" },
  { id: "cook", label: "Cooks" },
];

type P = ProviderDTO;
const SORTS = {
  rating: { label: "Top rated", fn: (a: P, b: P) => b.rating - a.rating || b.reviews - a.reviews },
  experience: { label: "Most experienced", fn: (a: P, b: P) => b.years - a.years },
  price: { label: "Lowest price", fn: (a: P, b: P) => a.rate - b.rate },
};

export default function CaregiverBrowser({ providers, cities }: { providers: ProviderDTO[]; cities: CityDTO[] }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Category | "all">("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<keyof typeof SORTS>("rating");
  const liveCities = cities.filter((c) => c.status === "live");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return providers
      .filter((c) => kind === "all" || c.category === kind)
      .filter((c) => city === "all" || c.citySlug === city)
      .filter((c) => !needle || [c.name, c.title, c.bio, c.locality, ...c.languages].join(" ").toLowerCase().includes(needle))
      .sort(SORTS[sort].fn);
  }, [providers, q, kind, city, sort]);

  const cityName = liveCities.find((c) => c.slug === city)?.name;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24">
      <div className="glass sticky top-20 z-30 mb-10 flex flex-col gap-3 rounded-[1.75rem] p-3 shadow-sm lg:flex-row lg:items-center">
        <label className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 py-3 ring-1 ring-blush-100 focus-within:ring-2 focus-within:ring-blush-300">
          <Search className="size-4.5 text-plum-300" />
          <span className="sr-only">Search maids and cooks</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, skill, locality or language, e.g. Urdu, diabetic"
            className="w-full bg-transparent text-sm text-plum-900 placeholder:text-plum-700/45 focus:outline-none"
          />
        </label>
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setKind(f.id)}
              aria-pressed={kind === f.id}
              className={clsx(
                "relative rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                kind === f.id ? "text-white" : "text-plum-700/70 hover:text-plum-900",
              )}
            >
              {kind === f.id && <motion.span layoutId="cg-filter" className="absolute inset-0 rounded-full bg-plum-900" />}
              <span className="relative">{f.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm ring-1 ring-blush-100">
            <span className="text-plum-700/60">City</span>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="min-w-0 flex-1 bg-transparent font-semibold text-plum-900 focus:outline-none">
              <option value="all">All cities</option>
              {liveCities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm ring-1 ring-blush-100">
            <span className="text-plum-700/60">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="min-w-0 flex-1 bg-transparent font-semibold text-plum-900 focus:outline-none">
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mb-6 text-sm text-plum-700/60">
        Showing <span className="font-semibold text-plum-900">{list.length}</span> verified maids &amp; cooks in {cityName ?? "Andhra Pradesh & Telangana"}
      </p>

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-[2rem] bg-white py-20 text-center ring-1 ring-blush-100">
          <span className="grid size-14 place-items-center rounded-2xl bg-blush-50 text-blush-500">
            <SearchX className="size-6" />
          </span>
          <p className="mt-4 font-display text-2xl text-plum-900">No one matches that yet</p>
          <p className="mt-1 text-sm text-plum-700/60">Try another city, language or skill, or book and let us match you with the right helper.</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <CaregiverCard c={c} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
