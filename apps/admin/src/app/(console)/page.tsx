import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardList, IndianRupee, ListChecks, MapPinned, UserRoundCheck } from "lucide-react";
import { formatINR, stateName, type AdminOverviewDTO } from "@lasan/shared";
import { apiGet } from "@/lib/api";
import { BookingBadge, Card, PageHeader, Skeleton, Table, Td, Th, fmtDateTime } from "@/components/ui";
import TrendChart from "./TrendChart";

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" description="The last 30 days across Andhra Pradesh and Telangana." />
      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>
    </>
  );
}

async function Overview() {
  const o = await apiGet<AdminOverviewDTO>("/admin/overview");
  const k = o.kpis;
  const tiles = [
    { label: "Bookings · 30 days", value: k.bookings30d.toLocaleString("en-IN"), icon: CalendarCheck, href: "/bookings", tint: "bg-lilac-100 text-plum-700" },
    { label: "Revenue · 30 days", value: formatINR(k.revenue30d), icon: IndianRupee, href: "/bookings", tint: "bg-blush-100 text-blush-600" },
    { label: "Active helpers", value: k.activeProviders.toLocaleString("en-IN"), icon: UserRoundCheck, href: "/helpers?status=active", tint: "bg-sage-100 text-sage-600" },
    { label: "Applications in review", value: k.pendingApplications.toLocaleString("en-IN"), icon: ClipboardList, href: "/onboarding", tint: "bg-peach-100 text-[#8a4b1f]" },
    { label: "Live cities", value: k.liveCities.toLocaleString("en-IN"), icon: MapPinned, href: "/cities", tint: "bg-sage-100 text-sage-600" },
    { label: "Waitlist leads", value: k.waitlistLeads.toLocaleString("en-IN"), icon: ListChecks, href: "/waitlist", tint: "bg-lilac-100 text-plum-700" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map(({ label, value, icon: Icon, href, tint }) => (
          <Link key={label} href={href} className="group rounded-[24px] bg-white p-5 ring-1 ring-blush-100 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgb(42_20_40/0.35)]">
            <span className={`grid size-9 place-items-center rounded-xl ${tint}`}>
              <Icon className="size-[18px]" />
            </span>
            <p className="mt-4 font-display text-2xl font-semibold text-plum-900 tabular-nums">{value}</p>
            <p className="mt-0.5 text-xs font-medium text-plum-700/65">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Bookings and revenue">
          <TrendChart daily={o.daily} />
        </Card>
        <Card title="Revenue by city" className="overflow-hidden">
          {o.byCity.length === 0 ? (
            <p className="text-sm text-plum-700/70">No live cities yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-plum-700/60 uppercase">
                  <th className="pb-3 font-semibold">City</th>
                  <th className="pb-3 text-right font-semibold">Bookings</th>
                  <th className="pb-3 text-right font-semibold">Helpers</th>
                  <th className="pb-3 text-right font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {o.byCity.map((c) => (
                  <tr key={c.citySlug} className="border-t border-blush-50">
                    <td className="py-3">
                      <p className="font-medium text-plum-900">{c.cityName}</p>
                      <p className="text-xs text-plum-700/60">{stateName(c.state)}</p>
                    </td>
                    <td className="py-3 text-right tabular-nums">{c.bookings}</td>
                    <td className="py-3 text-right tabular-nums">{c.providers}</td>
                    <td className="py-3 text-right font-semibold tabular-nums">{formatINR(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-plum-900">Recent bookings</h2>
          <Link href="/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-blush-600 hover:text-plum-900">
            All bookings <ArrowRight className="size-4" />
          </Link>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Booking</Th>
              <Th>For</Th>
              <Th>City</Th>
              <Th>Helper</Th>
              <Th>Status</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {o.recentBookings.map((b) => (
              <tr key={b.id} className="transition hover:bg-blush-50/50">
                <Td>
                  <Link href={`/bookings?id=${b.id}`} className="font-semibold text-plum-900 hover:text-blush-600">
                    {b.code}
                  </Link>
                  <p className="text-xs text-plum-700/60">{fmtDateTime(b.createdAt)}</p>
                </Td>
                <Td>{b.recipientName}</Td>
                <Td>
                  {b.cityName}
                  <p className="text-xs text-plum-700/60">{b.locality}</p>
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
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading overview">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-[24px]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-96 rounded-[28px]" />
        <Skeleton className="h-96 rounded-[28px]" />
      </div>
    </div>
  );
}
