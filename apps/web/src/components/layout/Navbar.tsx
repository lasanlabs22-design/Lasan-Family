"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, MapPin, Menu, X } from "lucide-react";
import clsx from "clsx";
import { CITY } from "@/lib/data";
import Logo from "./Logo";

const LINKS = [
  { href: "/services", label: "Services" },
  { href: "/caregivers", label: "Maids & cooks" },
  { href: "/#plans", label: "Care plans" },
  { href: "/dashboard", label: "Family app" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav
        className={clsx(
          "mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-6",
          scrolled || open ? "glass shadow-[0_8px_40px_-12px_rgb(42_20_40/0.18)]" : "bg-transparent",
        )}
      >
        <div className="flex items-center gap-3">
          <Logo />
          <Link
            href="/#tirupati"
            className="hidden items-center gap-1 rounded-full bg-blush-50 px-2.5 py-1 text-xs font-semibold text-blush-600 ring-1 ring-blush-100 transition-colors hover:bg-blush-100 sm:flex"
          >
            <MapPin className="size-3" /> {CITY.name}
          </Link>
        </div>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href} className="relative">
                <Link
                  href={l.href}
                  className={clsx(
                    "relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active ? "text-plum-900" : "text-plum-700/70 hover:text-plum-900",
                  )}
                >
                  {l.label}
                </Link>
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-blush-100"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/become-a-caregiver"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-plum-700/70 transition-colors hover:text-plum-900 lg:block"
          >
            Work with us
          </Link>
          <Link
            href="/book"
            className="group hidden items-center gap-1.5 rounded-full bg-plum-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blush-600 sm:inline-flex"
          >
            Book care
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-full bg-white/80 text-plum-900 ring-1 ring-plum-100 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass mx-auto mt-2 max-w-7xl rounded-3xl p-3 shadow-xl md:hidden"
          >
            {[...LINKS, { href: "/become-a-caregiver", label: "Work with us" }].map((l, i) => (
              <motion.div key={l.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium text-plum-900 hover:bg-blush-50"
                >
                  {l.label}
                  <ArrowRight className="size-4 text-plum-300" />
                </Link>
              </motion.div>
            ))}
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-plum-900 px-4 py-4 font-semibold text-white"
            >
              Book care <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
