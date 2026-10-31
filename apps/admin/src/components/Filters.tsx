"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";
import { inputClass } from "./ui";

type Option = { value: string; label: string };
type SelectFilter = { name: string; label: string; options: Option[] };

/** URL-driven filters: every change updates the query string, so filtered views are shareable. */
export default function Filters({ selects = [], searchPlaceholder }: { selects?: SelectFilter[]; searchPlaceholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const set = (name: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete("id");
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  const active = selects.some((s) => params.get(s.name)) || !!params.get("q");

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {searchPlaceholder && (
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            set("q", String(new FormData(e.currentTarget).get("q") ?? "").trim());
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-plum-500/60" />
          <input key={params.get("q") ?? ""} name="q" type="search" defaultValue={params.get("q") ?? ""} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className={`${inputClass} w-72 pl-9`} />
        </form>
      )}
      {selects.map((s) => (
        <select key={s.name} aria-label={s.label} value={params.get(s.name) ?? ""} onChange={(e) => set(s.name, e.target.value)} className={`${inputClass} pr-8`}>
          <option value="">{s.label}: all</option>
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      {active && (
        <button type="button" onClick={() => start(() => router.replace(pathname, { scroll: false }))} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-plum-700 hover:bg-blush-50">
          <X className="size-4" /> Clear
        </button>
      )}
      {pending && <Loader2 className="size-4 animate-spin text-plum-500" aria-label="Updating" />}
    </div>
  );
}
