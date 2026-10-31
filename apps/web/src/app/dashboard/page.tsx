import type { Metadata } from "next";
import FamilyDashboard from "./FamilyDashboard";

export const metadata: Metadata = { title: "Family dashboard · Nestly" };

export default function DashboardPage() {
  return (
    <div className="pt-28 sm:pt-32">
      <p className="mx-auto mb-4 max-w-7xl px-6 text-xs font-semibold tracking-[0.14em] text-blush-600 uppercase">Demo · Family dashboard</p>
      <FamilyDashboard />
    </div>
  );
}
