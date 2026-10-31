import type { Metadata } from "next";
import FamilyDashboard from "./FamilyDashboard";

export const metadata: Metadata = { title: "The Lasan Family app" };

export default function DashboardPage() {
  return (
    <div className="pt-28 sm:pt-32">
      <p className="mx-auto mb-4 max-w-7xl px-6 text-xs font-semibold tracking-[0.14em] text-blush-600 uppercase">Preview · What families see in the Lasan Family app</p>
      <FamilyDashboard />
    </div>
  );
}
