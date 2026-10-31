import { Suspense } from "react";
import type { Metadata } from "next";
import type { ServiceDTO } from "@lasan/shared";
import { apiGet } from "@/lib/api";
import { PageHeader, Table, TableSkeleton, Th } from "@/components/ui";
import ServiceRow from "./ServiceRow";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <>
      <PageHeader title="Services" description="Prices shown on the website and the app. Inactive services are hidden from customers." />
      <Suspense fallback={<TableSkeleton rows={7} />}>
        <Services />
      </Suspense>
    </>
  );
}

async function Services() {
  const rows = await apiGet<ServiceDTO[]>("/admin/services");
  return (
    <Table>
      <thead>
        <tr>
          <Th>Service</Th>
          <Th>Category</Th>
          <Th>Price (₹)</Th>
          <Th className="text-right">Active</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s) => (
          <ServiceRow key={`${s.slug}-${s.price}-${s.active}`} service={s} />
        ))}
      </tbody>
    </Table>
  );
}
