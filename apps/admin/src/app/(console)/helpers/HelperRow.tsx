"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { AdminProviderDTO } from "@lasan/shared";
import { updateProvider } from "@/lib/actions";
import { useAction } from "@/components/useAction";
import Toggle from "@/components/Toggle";
import { ProviderBadge, buttonClass, fmtPhone } from "@/components/ui";

export default function HelperRow({ helper: p }: { helper: AdminProviderDTO }) {
  const { pending, error, run } = useAction();
  const [rate, setRate] = useState(String(p.rate));
  const rateChanged = rate.trim() !== String(p.rate);
  const verified = p.aadhaarVerified && p.policeVerified;

  return (
    <>
      <tr className="transition hover:bg-blush-50/40">
        <td className="border-b border-blush-50 py-3.5 pr-4 pl-6 align-middle">
          <p className="font-semibold text-plum-900">{p.name}</p>
          <p className="text-xs text-plum-700/60">
            {p.title} · {fmtPhone(p.phone)}
          </p>
        </td>
        <td className="border-b border-blush-50 px-4 py-3.5 align-middle">
          {p.cityName}
          <p className="text-xs text-plum-700/60">{p.locality || "No locality"}</p>
        </td>
        <td className="border-b border-blush-50 px-4 py-3.5 align-middle">
          <ProviderBadge status={p.status} />
        </td>
        <td className="border-b border-blush-50 px-4 py-3.5 align-middle">
          <Toggle label={`Aadhaar verified for ${p.name}`} checked={p.aadhaarVerified} disabled={pending} onChange={(v) => run(() => updateProvider(p.id, { aadhaarVerified: v }))} />
        </td>
        <td className="border-b border-blush-50 px-4 py-3.5 align-middle">
          <Toggle label={`Police verified for ${p.name}`} checked={p.policeVerified} disabled={pending} onChange={(v) => run(() => updateProvider(p.id, { policeVerified: v }))} />
        </td>
        <td className="border-b border-blush-50 px-4 py-3.5 text-right align-middle tabular-nums">{p.activeBookings}</td>
        <td className="border-b border-blush-50 px-4 py-3.5 align-middle">
          <form
            className="flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => updateProvider(p.id, { rate: Number(rate) }));
            }}
          >
            <input
              aria-label={`Rate for ${p.name}`}
              inputMode="numeric"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/\D/g, ""))}
              className="w-20 rounded-xl bg-ivory px-2.5 py-1.5 text-sm tabular-nums ring-1 ring-blush-200 outline-none focus:ring-2 focus:ring-blush-300"
            />
            <span className="text-xs text-plum-700/60">/{p.unit}</span>
            {rateChanged && (
              <button type="submit" disabled={pending || !rate} className="grid size-7 place-items-center rounded-full bg-plum-900 text-white disabled:opacity-50" aria-label="Save rate">
                <Check className="size-3.5" />
              </button>
            )}
          </form>
        </td>
        <td className="border-b border-blush-50 py-3.5 pr-6 pl-4 text-right align-middle">
          <div className="flex items-center justify-end gap-2">
            {pending && <Loader2 className="size-4 animate-spin text-plum-500" aria-label="Saving" />}
            {p.status === "active" ? (
              <button type="button" disabled={pending} onClick={() => run(() => updateProvider(p.id, { status: "suspended" }))} className={`${buttonClass.danger} px-3 py-1.5 text-xs`}>
                Suspend
              </button>
            ) : (
              <button
                type="button"
                disabled={pending || !verified}
                title={verified ? undefined : "Verify Aadhaar and police first"}
                onClick={() => run(() => updateProvider(p.id, { status: "active" }))}
                className={`${buttonClass.primary} px-3 py-1.5 text-xs`}
              >
                Activate
              </button>
            )}
          </div>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={8} className="border-b border-blush-50 bg-blush-50 px-6 py-2 text-sm text-blush-600" role="alert">
            {p.name}: {error}
          </td>
        </tr>
      )}
    </>
  );
}
