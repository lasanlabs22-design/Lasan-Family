"use client";

import { useState } from "react";
import clsx from "clsx";
import { Loader2, Plus } from "lucide-react";
import type { CityStatus } from "@lasan/shared";
import { updateCity } from "@/lib/actions";
import { useAction } from "@/components/useAction";
import { ErrorNote } from "@/components/ui";
import type { AdminCity } from "./page";

const STATUSES: { value: CityStatus; label: string; on: string }[] = [
  { value: "live", label: "Live", on: "bg-sage-600 text-white" },
  { value: "waitlist", label: "Waitlist", on: "bg-gold-400 text-plum-900" },
  { value: "paused", label: "Paused", on: "bg-plum-500 text-white" },
];

export default function CityCard({ city: c }: { city: AdminCity }) {
  const { pending, error, run } = useAction();
  const [locality, setLocality] = useState("");
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? c.localities : c.localities.slice(0, 10);

  return (
    <article className="rounded-[28px] bg-white p-6 ring-1 ring-blush-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-plum-900">{c.name}</h3>
          <p className="mt-1 text-sm text-plum-700/65">
            <span className="font-semibold text-plum-900 tabular-nums">{c.bookings}</span> booking{c.bookings === 1 ? "" : "s"} ·{" "}
            <span className="font-semibold text-plum-900 tabular-nums">{c.leads}</span> waitlist lead{c.leads === 1 ? "" : "s"} ·{" "}
            <span className="tabular-nums">{c.localities.length}</span> localities
          </p>
        </div>
        <div role="radiogroup" aria-label={`${c.name} status`} className="inline-flex rounded-full bg-ivory p-1 ring-1 ring-blush-100">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={c.status === s.value}
              disabled={pending}
              onClick={() => c.status !== s.value && run(() => updateCity(c.slug, { status: s.value }))}
              className={clsx("rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-60", c.status === s.value ? s.on : "text-plum-700/70 hover:text-plum-900")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {c.localities.length === 0 && <p className="text-sm text-plum-700/60">No localities yet. Add at least one before going live.</p>}
        {shown.map((l) => (
          <span key={l} className="rounded-full bg-blush-50 px-2.5 py-1 text-xs font-medium text-plum-700">
            {l}
          </span>
        ))}
        {c.localities.length > 10 && (
          <button type="button" onClick={() => setShowAll((v) => !v)} className="rounded-full px-2.5 py-1 text-xs font-semibold text-blush-600 hover:bg-blush-50">
            {showAll ? "Show fewer" : `+${c.localities.length - 10} more`}
          </button>
        )}
      </div>

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => updateCity(c.slug, { addLocality: locality.trim() }), () => setLocality(""));
        }}
      >
        <input
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          placeholder="Add a locality"
          aria-label={`Add a locality to ${c.name}`}
          className="min-w-0 flex-1 rounded-full bg-ivory px-4 py-2 text-sm ring-1 ring-blush-200 outline-none placeholder:text-plum-700/40 focus:ring-2 focus:ring-blush-300"
        />
        <button type="submit" disabled={pending || locality.trim().length < 2} className="inline-flex items-center gap-1.5 rounded-full bg-plum-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum-700 disabled:opacity-50">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add
        </button>
      </form>
      {error && <ErrorNote className="mt-3">{error}</ErrorNote>}
    </article>
  );
}
