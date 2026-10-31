"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { ServiceDTO } from "@lasan/shared";
import { updateService } from "@/lib/actions";
import { useAction } from "@/components/useAction";
import Toggle from "@/components/Toggle";
import { Pill } from "@/components/ui";

export default function ServiceRow({ service: s }: { service: ServiceDTO }) {
  const { pending, error, run } = useAction();
  const [price, setPrice] = useState(String(s.price));
  const changed = price !== String(s.price);

  return (
    <>
      <tr className="transition hover:bg-blush-50/40">
        <td className="border-b border-blush-50 py-4 pr-4 pl-6 align-middle">
          <p className="font-semibold text-plum-900">{s.name}</p>
          <p className="max-w-md text-xs text-plum-700/60">{s.short}</p>
        </td>
        <td className="border-b border-blush-50 px-4 py-4 align-middle">
          <Pill className={s.category === "cook" ? "bg-peach-100 text-[#8a4b1f] ring-peach-300/60" : "bg-lilac-100 text-plum-700 ring-lilac-300/60"}>
            {s.category === "cook" ? "Home cook" : "Maid"}
          </Pill>
        </td>
        <td className="border-b border-blush-50 px-4 py-4 align-middle">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => updateService(s.slug, { price: Number(price) }));
            }}
          >
            <input
              aria-label={`Price for ${s.name}`}
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
              className="w-24 rounded-xl bg-ivory px-3 py-1.5 text-sm tabular-nums ring-1 ring-blush-200 outline-none focus:ring-2 focus:ring-blush-300"
            />
            <span className="text-xs text-plum-700/60">per {s.unit}</span>
            {changed && (
              <>
                <button type="submit" disabled={pending || !price} className="rounded-full bg-plum-900 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">
                  Save
                </button>
                <button type="button" onClick={() => setPrice(String(s.price))} className="rounded-full px-2 py-1 text-xs font-medium text-plum-700 hover:bg-blush-50">
                  Reset
                </button>
              </>
            )}
            {pending && <Loader2 className="size-4 animate-spin text-plum-500" />}
          </form>
        </td>
        <td className="border-b border-blush-50 py-4 pr-6 pl-4 text-right align-middle">
          <Toggle label={`${s.name} active`} checked={s.active} disabled={pending} onChange={(v) => run(() => updateService(s.slug, { active: v }))} />
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={4} role="alert" className="border-b border-blush-50 bg-blush-50 px-6 py-2 text-sm text-blush-600">
            {s.name}: {error}
          </td>
        </tr>
      )}
    </>
  );
}
