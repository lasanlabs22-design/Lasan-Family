import { Suspense } from "react";
import type { Metadata } from "next";
import { formatINR, type CustomerDTO } from "@lasan/shared";
import { apiGet } from "@/lib/api";
import Filters from "@/components/Filters";
import { Empty, PageHeader, Table, TableSkeleton, Td, Th, fmtDate, fmtPhone } from "@/components/ui";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage({ searchParams }: PageProps<"/customers">) {
  return (
    <>
      <PageHeader title="Customers" description="Families who signed in to book. Lifetime value excludes cancelled bookings." />
      <Suspense fallback={<TableSkeleton />}>
        <CustomersView searchParams={searchParams as Promise<{ q?: string }>} />
      </Suspense>
    </>
  );
}

async function CustomersView({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const rows = await apiGet<CustomerDTO[]>(`/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  return (
    <>
      <Filters searchPlaceholder="Name or phone" />
      {rows.length === 0 ? (
        <Empty title={q ? "No customers match" : "No customers yet"}>{q ? "Try a different name or phone number." : "Customers appear here after they sign in on the app or website."}</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Phone</Th>
              <Th>City</Th>
              <Th>Joined</Th>
              <Th className="text-right">Bookings</Th>
              <Th className="text-right">Lifetime value</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="transition hover:bg-blush-50/40">
                <Td className="font-semibold text-plum-900">{c.name}</Td>
                <Td>
                  <a href={`tel:${c.phone}`} className="hover:text-blush-600">
                    {fmtPhone(c.phone)}
                  </a>
                </Td>
                <Td>{c.cityName ?? <span className="text-plum-700/50">Not set</span>}</Td>
                <Td>{fmtDate(c.createdAt)}</Td>
                <Td className="text-right tabular-nums">{c.bookings}</Td>
                <Td className="text-right font-semibold tabular-nums">{formatINR(c.lifetimeValue)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
