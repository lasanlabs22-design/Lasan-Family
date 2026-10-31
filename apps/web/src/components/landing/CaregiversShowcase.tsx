import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import CaregiverCard from "@/components/CaregiverCard";
import { CAREGIVERS } from "@/lib/data";

export default function CaregiversShowcase() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            align="left"
            eyebrow="Meet the carers"
            title={
              <>
                Women you&apos;d <em className="text-gradient">trust with family</em>
              </>
            }
            text="Fewer than 1 in 8 applicants join Nestly. The ones who do are verified, trained and genuinely kind."
          />
          <Reveal delay={0.1}>
            <Button href="/caregivers" variant="secondary">
              Browse all caregivers <ArrowUpRight className="size-4" />
            </Button>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CAREGIVERS.slice(0, 4).map((c, i) => (
            <Reveal key={c.id} delay={i * 0.08}>
              <CaregiverCard c={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
