import type { Metadata } from "next";
import Image from "next/image";
import { CalendarClock, GraduationCap, HeartHandshake, ShieldCheck, Wallet } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ApplyForm from "./ApplyForm";
import { getCities } from "@/lib/api";
import { FACES, unsplash } from "@/lib/data";

export const metadata: Metadata = { title: "Work with us · Lasan Family" };

const PERKS = [
  { icon: Wallet, title: "Earn up to ₹25,000/mo", text: "Fair, transparent pay, sent to your bank every week." },
  { icon: CalendarClock, title: "Choose your hours", text: "Day shifts, live-in or a few visits a week. You decide." },
  { icon: GraduationCap, title: "Free certification", text: "Elder-care etiquette, kitchen hygiene, diet cooking and first aid." },
  { icon: ShieldCheck, title: "Health & safety cover", text: "Insurance, an SOS line and a team that has your back." },
];

const STEPS = ["Apply online in 5 minutes", "Phone chat & document check", "Skills session at our centre", "Start receiving bookings"];

export default async function BecomeCaregiverPage() {
  const cities = await getCities();
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={
          <>
            Your kindness is a <em className="text-gradient">profession</em> here
          </>
        }
        text="Join verified maids and cooks across Andhra Pradesh and Telangana who have found steady, respected work, with free training, fair pay and families who value them."
      >
        <div className="mt-10 flex justify-center -space-x-4">
          {FACES.map((id, i) => (
            <Reveal key={id} delay={i * 0.05} y={12}>
              <Image src={unsplash(id, 120, 120)} alt="" width={60} height={60} className="size-11 rounded-full object-cover ring-4 ring-cream sm:size-15" />
            </Reveal>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="rounded-[2rem] bg-white p-7 ring-1 ring-blush-100">
              <span className="grid size-12 place-items-center rounded-2xl bg-blush-50 text-blush-600">
                <p.icon className="size-5" />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-plum-900">{p.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-plum-700/70">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ivory py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="How to join"
              title={
                <>
                  Four steps to your <em className="text-gradient">first family</em>
                </>
              }
            />
            <ol className="mt-10 space-y-4">
              {STEPS.map((s, i) => (
                <Reveal key={s} delay={i * 0.08}>
                  <li className="flex items-center gap-5 rounded-3xl bg-white p-5 ring-1 ring-blush-100">
                    <span className="font-display text-4xl text-blush-300">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-semibold text-plum-900">{s}</span>
                  </li>
                </Reveal>
              ))}
            </ol>
            <Reveal delay={0.3} className="mt-6 flex items-start gap-3 rounded-3xl bg-sage-100 p-5 text-sm text-plum-700">
              <HeartHandshake className="size-5 shrink-0 text-sage-600" />
              No fees, ever. Lasan Family never charges helpers to join, train or get bookings.
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <ApplyForm cities={cities} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
