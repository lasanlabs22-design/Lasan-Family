import { Suspense } from "react";
import type { Metadata } from "next";
import { PROVIDER_STATUSES, type AdminProviderDTO, type CityDTO } from "@lasan/shared";
import { apiGet } from "@/lib/api";
import Filters from "@/components/Filters";
import { Empty, PageHeader, Table, TableSkeleton, Th } from "@/components/ui";
import HelperRow from "./HelperRow";

export const metadata: Metadata = { title: "Helpers" };

type Search = { status?: string; city?: string; q?: string };

export default function HelpersPage({ searchParams }: PageProps<"/helpers">) {
  return (
    <>
      <PageHeader title="Helpers" description="Maids and home cooks on the platform. A helper can be activated only after Aadhaar and police verification." />
      <Suspense fallback={<TableSkeleton />}>
        <HelpersView searchParams={searchParams as Promise<Search>} />
      </Suspense>
    </>
  );
}

async function HelpersView({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.status) qs.set("status", sp.status);
  if (sp.city) qs.set("city", sp.city);
  if (sp.q) qs.set("q", sp.q);
  const [rows, cities] = await Promise.all([apiGet<AdminProviderDTO[]>(`/admin/providers?${qs}`), apiGet<CityDTO[]>("/admin/cities")]);

  return (
    <>
      <Filters
        searchPlaceholder="Name or phone"
        selects={[
          { name: "status", label: "Status", options: PROVIDER_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })) },
          { name: "city", label: "City", options: cities.map((c) => ({ value: c.slug, label: c.name })) },
        ]}
      />
      {rows.length === 0 ? (
        <Empty title="No helpers match">Try a different status, city or search.</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Helper</Th>
              <Th>City</Th>
              <Th>Status</Th>
              <Th>Aadhaar</Th>
              <Th>Police</Th>
              <Th className="text-right">Active bookings</Th>
              <Th>Rate (₹)</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <HelperRow key={`${p.id}-${p.status}-${p.rate}-${p.aadhaarVerified}-${p.policeVerified}`} helper={p} />
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
