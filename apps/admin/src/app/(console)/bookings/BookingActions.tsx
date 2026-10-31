"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Star, UserRoundPlus, XCircle } from "lucide-react";
import { formatINR, type AdminProviderDTO, type BookingDTO } from "@lasan/shared";
import { updateBooking } from "@/lib/actions";
import { useAction } from "@/components/useAction";
import { buttonClass, ErrorNote, inputClass } from "@/components/ui";

export default function BookingActions({ booking: b, helpers }: { booking: BookingDTO; helpers: AdminProviderDTO[] }) {
  const { pending, error, run } = useAction();
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Requested helper first, then helpers matching the need, then the same locality, then fewest active bookings.
  const ranked = useMemo(() => {
    const score = (p: AdminProviderDTO) =>
      (p.id === b.requestedProviderId ? 1000 : 0) + (b.need === "both" || p.category === b.need ? 100 : 0) + (p.locality === b.locality ? 10 : 0) - p.activeBookings;
    return [...helpers].sort((x, y) => score(y) - score(x) || x.name.localeCompare(y.name));
  }, [helpers, b]);

  const [pick, setPick] = useState(b.provider?.id ?? ranked[0]?.id ?? "");
  const closed = b.status === "completed" || b.status === "cancelled";
  const requested = helpers.find((h) => h.id === b.requestedProviderId);

  return (
    <div className="space-y-4">
      {!closed && (
        <section className="rounded-[24px] bg-white p-5 ring-1 ring-blush-100">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-plum-900">
            <UserRoundPlus className="size-4 text-blush-500" /> {b.provider ? "Assigned helper" : "Assign a helper"}
          </h3>
          {b.provider && (
            <p className="mt-1 text-sm text-plum-700/80">
              {b.provider.name} · {b.provider.title}
            </p>
          )}
          {b.requestedProviderId && !b.provider && (
            <p className="mt-1 text-xs text-plum-700/70">
              {requested ? `The customer asked for ${requested.name}.` : "The customer asked for a helper who is not active in this city right now."}
            </p>
          )}
          {ranked.length === 0 ? (
            <p className="mt-3 text-sm text-plum-700/70">No active helpers in {b.cityName} yet. Approve applicants on the Onboarding board first.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <select aria-label="Helper" value={pick} onChange={(e) => setPick(e.target.value)} className={`${inputClass} min-w-0 flex-1`}>
                {ranked.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id === b.requestedProviderId ? "★ " : ""}
                    {p.name} · {p.title} · {p.locality} · {p.activeBookings} active · {formatINR(p.rate)}/{p.unit}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={pending || !pick || pick === b.provider?.id}
                onClick={() => run(() => updateBooking(b.id, { providerId: pick }))}
                className={buttonClass.primary}
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                {b.provider ? "Reassign" : "Assign"}
              </button>
            </div>
          )}
          {requested && (
            <p className="mt-2 flex items-center gap-1 text-xs text-plum-700/60">
              <Star className="size-3 fill-gold-400 text-gold-400" /> marks the helper the customer requested.
            </p>
          )}
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {b.status === "requested" && (
          <button
            type="button"
            disabled={pending || !b.provider}
            title={b.provider ? undefined : "Assign a helper first"}
            onClick={() => run(() => updateBooking(b.id, { status: "confirmed" }))}
            className={buttonClass.primary}
          >
            <CheckCircle2 className="size-4" /> Confirm
          </button>
        )}
        {(b.status === "confirmed" || b.status === "active") && (
          <button type="button" disabled={pending} onClick={() => run(() => updateBooking(b.id, { status: "completed" }))} className={buttonClass.primary}>
            <CheckCircle2 className="size-4" /> Mark completed
          </button>
        )}
        {!closed &&
          (confirmCancel ? (
            <>
              <button type="button" disabled={pending} onClick={() => run(() => updateBooking(b.id, { status: "cancelled" }), () => setConfirmCancel(false))} className={buttonClass.danger}>
                <XCircle className="size-4" /> Yes, cancel booking
              </button>
              <button type="button" onClick={() => setConfirmCancel(false)} className={buttonClass.secondary}>
                Keep it
              </button>
            </>
          ) : (
            <button type="button" disabled={pending} onClick={() => setConfirmCancel(true)} className={buttonClass.danger}>
              <XCircle className="size-4" /> Cancel
            </button>
          ))}
        {closed && <p className="text-sm text-plum-700/70">This booking is {b.status}. No further actions.</p>}
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </div>
  );
}
