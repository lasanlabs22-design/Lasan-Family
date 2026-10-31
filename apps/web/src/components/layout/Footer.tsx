import { MapPin } from "lucide-react";
import Link from "next/link";
import { CITY } from "@/lib/data";
import Logo from "./Logo";

const COLS = [
  {
    title: "Services",
    links: [
      { label: "Maids & home help", href: "/services?type=maid" },
      { label: "Home cooks", href: "/services?type=cook" },
      { label: "Deep cleaning", href: "/book?service=deep-cleaning" },
      { label: "Diet-specific meals", href: "/book?service=diet-cook" },
    ],
  },
  {
    title: "Nestly",
    links: [
      { label: "Find maids & cooks", href: "/caregivers" },
      { label: "Family app", href: "/dashboard" },
      { label: "Care plans", href: "/#plans" },
      { label: "Work with us", href: "/become-a-caregiver" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "/#faq" },
      { label: "Safety & verification", href: "/#faq" },
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
    ],
  },
];

const SOCIAL = [
  {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 4.8a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-9.6a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z",
  },
  {
    label: "LinkedIn",
    path: "M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 110-4.2 2.1 2.1 0 010 4.2zM7.1 20.5H3.6V9h3.5v11.5z",
  },
  {
    label: "YouTube",
    path: "M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z",
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-plum-900 text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-blush-500/25 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm text-white/65">
              Trusted maids and home cooks for elderly women, so she can rest easy in her own home.
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm text-blush-200">
              <MapPin className="size-4" /> Currently serving {CITY.name}, {CITY.state} only
            </p>
            <form className="mt-8 flex max-w-sm gap-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 focus-within:ring-blush-300">
              <label htmlFor="footer-email" className="sr-only">
                Email
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Your email for care tips"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
              />
              <button type="button" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-plum-900 hover:bg-blush-100">
                Subscribe
              </button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLS.map((c) => (
              <div key={c.title}>
                <h3 className="text-sm font-semibold tracking-wider text-blush-200 uppercase">{c.title}</h3>
                <ul className="mt-4 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-white/70 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-20 font-display text-[18vw] leading-none font-semibold tracking-tighter text-white/[0.06] select-none lg:text-[13rem]">
          nestly
        </p>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row sm:items-center">
          <p>© 2026 Nestly. Made with love for the women who raised us.</p>
          <div className="flex gap-3">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid size-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-blush-500"
              >
                <svg viewBox="0 0 24 24" className="size-4 fill-white">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
