import Image from "next/image";
import { ArrowRight, Phone } from "lucide-react";
import Aurora from "@/components/graphics/Aurora";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { BRAND, IMG, unsplash } from "@/lib/data";

export default function CTA() {
  return (
    <section className="px-3 py-16 sm:px-6 sm:py-24">
      <Reveal className="grain relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-plum-900 px-6 py-20 text-center sm:px-12 sm:py-28">
        <Aurora variant="dusk" />
        <div className="absolute top-10 left-10 hidden size-28 rotate-[-8deg] overflow-hidden rounded-3xl opacity-80 ring-4 ring-white/10 lg:block">
          <Image src={unsplash(IMG.chapati, 300, 300)} alt="" fill sizes="112px" className="object-cover" />
        </div>
        <div className="absolute right-12 bottom-12 hidden size-32 rotate-[6deg] overflow-hidden rounded-3xl opacity-80 ring-4 ring-white/10 lg:block">
          <Image src={unsplash(IMG.elderReading, 300, 300)} alt="" fill sizes="128px" className="object-cover" />
        </div>
        <div className="absolute top-16 right-24 hidden size-20 rotate-[10deg] overflow-hidden rounded-2xl opacity-70 ring-4 ring-white/10 lg:block">
          <Image src={unsplash(IMG.dosa, 200, 200)} alt="" fill sizes="80px" className="object-cover" />
        </div>
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-4xl leading-[1.05] font-medium text-white sm:text-6xl">
            Help at home, done right. <em className="text-blush-300">Every single day.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-white/70">
            Tell us what you need and we&apos;ll match a verified maid or cook, often by tomorrow morning.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/book" variant="light" className="px-7 py-4 text-base">
              Book care now <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button href={BRAND.supportPhoneHref} variant="ghost" className="px-7 py-4 text-base text-white ring-1 ring-white/25 hover:bg-white/10">
              <Phone className="size-4" /> Talk to a coordinator
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
