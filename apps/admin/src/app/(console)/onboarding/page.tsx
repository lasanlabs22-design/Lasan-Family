import { Suspense } from "react";
import type { Metadata } from "next";
import type { ApplicationDTO } from "@lasan/shared";
import { apiGet } from "@/lib/api";
import { PageHeader, Skeleton } from "@/components/ui";
import Board from "./Board";

export const metadata: Metadata = { title: "Onboarding" };

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        title="Onboarding"
        description="Applications from women who want to work with Lasan Family. Drag a card or use its menu to move it. Approving creates an active helper profile."
      />
      <Suspense
        fallback={
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-[28rem] w-72 shrink-0 rounded-[24px]" />
            ))}
          </div>
        }
      >
        <Applications />
      </Suspense>
    </>
  );
}

async function Applications() {
  const apps = await apiGet<ApplicationDTO[]>("/admin/applications");
  return <Board applications={apps} />;
}
