import type { Metadata } from "next";
import { Suspense } from "react";
import PageHero from "@/components/ui/PageHero";
import CTA from "@/components/landing/CTA";
import ServicesExplorer from "./ServicesExplorer";

export const metadata: Metadata = { title: "Services · Lasan Family" };

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            A spotless home and <em className="text-gradient">meals you love</em>
          </>
        }
        text="Verified maids and home cooks across Andhra Pradesh and Telangana, from one trusted team. Book a single visit, daily help, or bundle both into a monthly plan."
      />
      <Suspense fallback={<div className="h-[60vh]" />}>
        <ServicesExplorer />
      </Suspense>
      <CTA />
    </>
  );
}
