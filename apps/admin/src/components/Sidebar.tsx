"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CalendarCheck, ClipboardList, LayoutDashboard, ListChecks, MapPinned, Tags, Users, UserRoundCheck } from "lucide-react";
import Logo from "./Logo";

export const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/helpers", label: "Helpers", icon: UserRoundCheck },
  { href: "/onboarding", label: "Onboarding", icon: ClipboardList },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/cities", label: "Cities", icon: MapPinned },
  { href: "/services", label: "Services", icon: Tags },
  { href: "/waitlist", label: "Waitlist", icon: ListChecks },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-blush-100 bg-ivory px-4 py-6 md:flex">
      <div className="px-3">
        <Logo />
        <p className="mt-2 text-[11px] font-semibold tracking-[0.18em] text-plum-700/50 uppercase">Operations</p>
      </div>
      <nav className="mt-8 flex flex-col gap-1" aria-label="Admin sections">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-plum-900 text-white shadow-[0_6px_18px_-10px_rgb(42_20_40/0.6)]" : "text-plum-700 hover:bg-blush-50",
              )}
            >
              <Icon className={clsx("size-[18px]", active ? "text-blush-200" : "text-plum-500/70")} />
              {label}
            </Link>
          );
        })}
      </nav>
      <p className="mt-auto px-3 text-xs leading-relaxed text-plum-700/50">
        Maids and home cooks for women at home in Andhra Pradesh and Telangana.
      </p>
    </aside>
  );
}

/** Compact horizontal nav for tablet widths where the sidebar is hidden. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 md:hidden" aria-label="Admin sections">
      {NAV.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx("rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap", active ? "bg-plum-900 text-white" : "text-plum-700 hover:bg-blush-50")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
