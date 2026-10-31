import { BadgeCheck, ChefHat, Clock, HeartHandshake, Lock, ShieldCheck, Users, Wallet } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "Police & ID verified" },
  { icon: Users, label: "All-women helpers" },
  { icon: Clock, label: "Replacement within 24 hrs" },
  { icon: ChefHat, label: "Hygiene-trained cooks" },
  { icon: Wallet, label: "Pay after each visit" },
  { icon: HeartHandshake, label: "24×7 care manager" },
  { icon: Lock, label: "Private & secure" },
  { icon: BadgeCheck, label: "Skills-certified" },
];

export default function TrustBar() {
  return (
    <section aria-label="Our promises" className="border-y border-blush-100 bg-white/60 py-5">
      <div className="mask-fade-x flex overflow-hidden">
        <ul className="flex w-max animate-marquee gap-12 pr-12 [--marquee-duration:45s] hover:[animation-play-state:paused]">
          {[...ITEMS, ...ITEMS].map((it, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm font-medium whitespace-nowrap text-plum-700" aria-hidden={i >= ITEMS.length}>
              <it.icon className="size-4.5 text-blush-500" />
              {it.label}
              <span className="ml-10 size-1 rounded-full bg-blush-300" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
