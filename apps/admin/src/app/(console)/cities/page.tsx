import { Suspense } from "react";
import type { Metadata } from "next";
import { STATES, type CityDTO } from "@lasan/shared";
import { apiGet } from "@/lib/api";
import { PageHeader, Skeleton } from "@/components/ui";
import CityCard from "./CityCard";

export const metadata: Metadata = { title: "Cities" };

export type AdminCity = CityDTO & { bookings: number; leads: number };

export default function CitiesPage() {
  return (
    <>
      <PageHeader title="Cities" description="Live cities take bookings. Waitlist cities collect leads. Paused cities are hidden from customers." />
      <Suspense
        fallback={
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-56 rounded-[28px]" />
            ))}
          </div>
        }
      >
        <Cities />
      </Suspense>
    </>
  );
}

async function Cities() {
  const cities = await apiGet<AdminCity[]>("/admin/cities");
  return (
    <div className="space-y-10">
      {STATES.map((s) => {
        const list = cities.filter((c) => c.state === s.code);
        return (
          <section key={s.code} aria-labelledby={`state-${s.code}`}>
            <div className="mb-4 flex items-baseline gap-3">
              <h2 id={`state-${s.code}`} className="font-display text-xl font-semibold text-plum-900">
                {s.name}
              </h2>
              <p className="text-sm text-plum-700/60">
                {list.filter((c) => c.status === "live").length} live of {list.length}
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {list.map((c) => (
                <CityCard key={`${c.slug}-${c.status}-${c.localities.length}`} city={c} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
