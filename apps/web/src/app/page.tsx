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

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <NeedPicker />
      <ServicesBento />
      <ServiceArea />
      <HowItWorks />
      <Journey />
      <FamilyApp />
      <CaregiversShowcase />
      <Testimonials />
      <Plans />
      <FAQ />
      <CTA />
    </>
  );
}
