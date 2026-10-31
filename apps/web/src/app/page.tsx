import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import NeedPicker from "@/components/landing/NeedPicker";
import ServicesBento from "@/components/landing/ServicesBento";
import HowItWorks from "@/components/landing/HowItWorks";
import Journey from "@/components/landing/Journey";
import FamilyApp from "@/components/landing/FamilyApp";
import CaregiversShowcase from "@/components/landing/CaregiversShowcase";
import Testimonials from "@/components/landing/Testimonials";
import Plans from "@/components/landing/Plans";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import ServiceArea from "@/components/landing/ServiceArea";
import { getCities, getProviders } from "@/lib/api";

export default async function Home() {
  const [cities, providers] = await Promise.all([getCities(), getProviders()]);
  // One standout helper per city keeps the showcase representative of both states.
  const featured = providers.filter((p, i, all) => all.findIndex((x) => x.citySlug === p.citySlug) === i).slice(0, 4);

  return (
    <>
      <Hero />
      <TrustBar />
      <NeedPicker />
      <ServicesBento />
      <ServiceArea cities={cities} />
      <HowItWorks />
      <Journey />
      <FamilyApp />
      <CaregiversShowcase providers={featured} />
      <Testimonials />
      <Plans />
      <FAQ />
      <CTA />
    </>
  );
}
