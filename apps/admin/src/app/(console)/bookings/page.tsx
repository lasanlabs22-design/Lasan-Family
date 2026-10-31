import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { BOOKING_STATUSES, BOOKING_STATUS_LABEL, FREQUENCIES, formatINR, type AdminProviderDTO, type BookingDTO, type CityDTO } from "@lasan/shared";
import { apiGet } from "@/lib/api";
import Filters from "@/components/Filters";
import { BookingBadge, Empty, PageHeader, Table, TableSkeleton, Td, Th, fmtDate, fmtDateTime, fmtPhone } from "@/components/ui";
import BookingActions from "./BookingActions";

export const metadata: Metadata = { title: "Bookings" };

type Search = { status?: string; city?: string; q?: string; id?: string };

export default function BookingsPage({ searchParams }: PageProps<"/bookings">) {
  return (
    <>
      <PageHeader title="Bookings" description="Every request from the website and the app. Assign a helper to confirm a booking and schedule its visits." />
      <Suspense fallback={<TableSkeleton />}>
        <BookingsView searchParams={searchParams as Promise<Search>} />
      </Suspense>
    </>
  );
}

async function BookingsView({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.status) qs.set("status", sp.status);
  if (sp.city) qs.set("city", sp.city);
  if (sp.q) qs.set("q", sp.q);
  const [rows, cities] = await Promise.all([apiGet<BookingDTO[]>(`/admin/bookings?${qs}`), apiGet<CityDTO[]>("/admin/cities")]);

  let selected = sp.id ? rows.find((b) => b.id === sp.id) : undefined;
  if (sp.id && !selected) selected = (await apiGet<BookingDTO[]>("/admin/bookings")).find((b) => b.id === sp.id);
  const keep = (id?: string) => {
    const p = new URLSearchParams(qs);
    if (id) p.set("id", id);
    return `/bookings${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <Filters
        searchPlaceholder="Code, name, phone or locality"
        selects={[
          { name: "status", label: "Status", options: BOOKING_STATUSES.map((s) => ({ value: s, label: BOOKING_STATUS_LABEL[s] })) },
          { name: "city", label: "City", options: cities.map((c) => ({ value: c.slug, label: c.name })) },
        ]}
      />
      {rows.length === 0 ? (
        <Empty title="No bookings match">Try a different status, city or search.</Empty>
      ) : (
        <>
          <p className="mb-3 text-xs font-medium text-plum-700/60">
            {rows.length} booking{rows.length === 1 ? "" : "s"}
            {rows.length === 300 ? " (showing the latest 300)" : ""}
          </p>
          <Table>
            <thead>
              <tr>
                <Th>Booking</Th>
                <Th>For</Th>
                <Th>Services</Th>
                <Th>City</Th>
                <Th>Starts</Th>
                <Th>Helper</Th>
                <Th>Status</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className={b.id === selected?.id ? "bg-blush-50" : "transition hover:bg-blush-50/50"}>
                  <Td>
                    <Link href={keep(b.id)} scroll={false} className="font-semibold text-plum-900 hover:text-blush-600">
                      {b.code}
                    </Link>
                    <p className="text-xs text-plum-700/60">{fmtDateTime(b.createdAt)}</p>
                  </Td>
                  <Td>
                    {b.recipientName}
                    <p className="text-xs text-plum-700/60">{fmtPhone(b.phone)}</p>
                  </Td>
                  <Td className="max-w-56">
                    <p className="truncate">{b.planSlug ? `${b.planSlug[0].toUpperCase()}${b.planSlug.slice(1)} plan` : b.services.map((s) => s.name).join(", ")}</p>
                    <p className="text-xs text-plum-700/60">{FREQUENCIES.find((f) => f.id === b.frequency)?.label ?? b.frequency}</p>
                  </Td>
                  <Td>
                    {b.cityName}
                    <p className="text-xs text-plum-700/60">{b.locality}</p>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {fmtDate(b.startDate)}
                    <p className="text-xs text-plum-700/60">{b.slot}</p>
                  </Td>
                  <Td>{b.provider?.name ?? <span className="text-plum-700/50">Unassigned</span>}</Td>
                  <Td>
                    <BookingBadge status={b.status} />
                  </Td>
                  <Td className="text-right font-semibold tabular-nums">{formatINR(b.total)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
      {selected && <BookingDrawer booking={selected} closeHref={keep()} />}
    </>
  );
}

async function BookingDrawer({ booking: b, closeHref }: { booking: BookingDTO; closeHref: string }) {
  const helpers = await apiGet<AdminProviderDTO[]>(`/admin/providers?status=active&city=${encodeURIComponent(b.citySlug)}`);
  const freq = FREQUENCIES.find((f) => f.id === b.frequency)?.label ?? b.frequency;
  const rows: [string, React.ReactNode][] = [
    ["Booked", fmtDateTime(b.createdAt)],
    ["For", `${b.recipientName} (${b.forWhom})`],
    ["Phone", <a key="p" href={`tel:${b.phone}`} className="text-blush-600 hover:underline">{fmtPhone(b.phone)}</a>],
    ["Need", b.need === "both" ? "Maid and cook" : b.need === "maid" ? "Maid" : "Home cook"],
    ["Plan", b.planSlug ? `${b.planSlug[0].toUpperCase()}${b.planSlug.slice(1)}` : "None"],
    ["Services", b.services.length ? b.services.map((s) => s.name).join(", ") : "Included in plan"],
    ["Frequency", freq],
    ["Starts", `${fmtDate(b.startDate)} · ${b.slot}`],
    ["Address", `${b.address}, ${b.locality}, ${b.cityName}`],
    ["Food", b.food ?? "Not specified"],
    ["Diets", b.diets.length ? b.diets.join(", ") : "None"],
    ["Notes", b.notes || "None"],
    ["Total", <span key="t" className="font-semibold">{formatINR(b.total)}</span>],
  ];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <Link href={closeHref} scroll={false} aria-label="Close booking details" className="absolute inset-0 animate-fade bg-plum-900/20 backdrop-blur-[2px]" />
      <aside role="dialog" aria-modal="true" aria-labelledby="drawer-title" className="relative flex h-full w-full max-w-lg animate-drawer flex-col overflow-y-auto bg-ivory shadow-[-24px_0_60px_-30px_rgb(42_20_40/0.35)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-blush-100 bg-ivory/95 px-7 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-plum-700/50 uppercase">Booking</p>
            <h2 id="drawer-title" className="mt-0.5 font-display text-2xl font-semibold text-plum-900">
              {b.code}
            </h2>
            <div className="mt-2">
              <BookingBadge status={b.status} />
            </div>
          </div>
          <Link href={closeHref} scroll={false} className="grid size-9 place-items-center rounded-full text-plum-700 hover:bg-blush-50" aria-label="Close">
            <X className="size-5" />
          </Link>
        </div>
        <div className="space-y-7 px-7 py-6">
          <BookingActions key={`${b.id}-${b.status}-${b.provider?.id ?? ""}`} booking={b} helpers={helpers} />
          <dl className="divide-y divide-blush-100 rounded-[24px] bg-white px-5 ring-1 ring-blush-100">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 py-3 text-sm">
                <dt className="text-plum-700/60">{k}</dt>
                <dd className="text-plum-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
