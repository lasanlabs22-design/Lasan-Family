import type { Metadata } from "next";
import { BadgeCheck, ShieldCheck, Users } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import CaregiverBrowser from "./CaregiverBrowser";
import { getCities, getProviders } from "@/lib/api";

export const metadata: Metadata = { title: "Maids & cooks · Lasan Family" };

export default async function CaregiversPage() {
  const [providers, cities] = await Promise.all([getProviders(), getCities()]);
  return (
    <>
      <PageHero
        eyebrow="Maids & cooks"
        title={
          <>
            Meet the women behind <em className="text-gradient">every visit</em>
          </>
        }
        text="Every maid and cook here is ID-verified, police-checked, trial-tested and reviewed by real families."
      >
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          {[
            { icon: ShieldCheck, label: "Police verified" },
            { icon: BadgeCheck, label: "Trial-tested" },
            { icon: Users, label: "All women helpers" },
          ].map((b) => (
            <span key={b.label} className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 font-medium text-plum-700 ring-1 ring-blush-100">
              <b.icon className="size-4 text-sage-600" /> {b.label}
            </span>
          ))}
        </div>
      </PageHero>
      <CaregiverBrowser providers={providers} cities={cities} />
    </>
  );
}
