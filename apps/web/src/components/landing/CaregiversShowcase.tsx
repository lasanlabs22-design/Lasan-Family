import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import CaregiverCard from "@/components/CaregiverCard";
import type { ProviderDTO } from "@/lib/data";

export default function CaregiversShowcase({ providers }: { providers: ProviderDTO[] }) {
  if (!providers.length) return null;
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            align="left"
            eyebrow="Meet the helpers"
            title={
              <>
                Women you&apos;d <em className="text-gradient">trust with family</em>
              </>
            }
            text="Only a small share of applicants join Lasan Family. The ones who do are verified, trained and genuinely kind."
          />
          <Reveal delay={0.1}>
            <Button href="/caregivers" variant="secondary">
              Browse all maids &amp; cooks <ArrowUpRight className="size-4" />
            </Button>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {providers.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.08}>
              <CaregiverCard c={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
