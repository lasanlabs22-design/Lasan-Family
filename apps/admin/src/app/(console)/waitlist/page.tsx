import { Suspense } from "react";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import type { LeadDTO } from "@lasan/shared";
import { apiGet } from "@/lib/api";
import { Card, Empty, PageHeader, TableSkeleton, buttonClass, fmtDateTime, fmtPhone } from "@/components/ui";

export const metadata: Metadata = { title: "Waitlist" };

export default function WaitlistPage() {
  return (
    <>
      <PageHeader
        title="Waitlist"
        description="Phone numbers left by women in cities and localities we don't serve yet."
        actions={
          // A plain link: the Route Handler streams a CSV download.
          <a href="/waitlist/export" className={buttonClass.secondary} download>
            <Download className="size-4" /> Export CSV
          </a>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <Leads />
      </Suspense>
    </>
  );
}

async function Leads() {
  const leads = await apiGet<LeadDTO[]>("/admin/leads");
  if (leads.length === 0) return <Empty title="No waitlist leads yet">Leads from the website and the app will appear here.</Empty>;

  const groups = new Map<string, LeadDTO[]>();
  for (const l of leads) {
    const key = l.city.trim() || "Unknown city";
    groups.set(key, [...(groups.get(key) ?? []), l]);
  }
  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  return (
    <div className="space-y-5">
      <p className="text-sm text-plum-700/70">
        {leads.length} lead{leads.length === 1 ? "" : "s"} across {sorted.length} cit{sorted.length === 1 ? "y" : "ies"}
      </p>
      {sorted.map(([city, rows]) => (
        <Card key={city} title={city} action={<span className="rounded-full bg-blush-50 px-2.5 py-0.5 text-xs font-semibold text-plum-700 tabular-nums">{rows.length}</span>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-plum-700/60 uppercase">
                  <th className="pb-2 font-semibold">Phone</th>
                  <th className="pb-2 font-semibold">Locality</th>
                  <th className="pb-2 font-semibold">Source</th>
                  <th className="pb-2 text-right font-semibold">Added</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className="border-t border-blush-50">
                    <td className="py-2.5">
                      <a href={`tel:${l.phone}`} className="font-medium text-plum-900 hover:text-blush-600">
                        {fmtPhone(l.phone)}
                      </a>
                    </td>
                    <td className="py-2.5">{l.locality || <span className="text-plum-700/50">Not given</span>}</td>
                    <td className="py-2.5 capitalize">{l.source}</td>
                    <td className="py-2.5 text-right text-plum-700/70">{fmtDateTime(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
