"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

/** Top-bar search: finds bookings by code, name, phone or locality. */
export default function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <form
      role="search"
      className="relative w-full max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
        router.push(q ? `/bookings?q=${encodeURIComponent(q)}` : "/bookings");
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-plum-500/60" />
      <input
        name="q"
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder="Search bookings by code, name, phone or locality"
        aria-label="Search bookings"
        className="w-full rounded-full bg-white py-2.5 pr-4 pl-10 text-sm ring-1 ring-blush-100 outline-none placeholder:text-plum-700/40 focus:ring-2 focus:ring-blush-300"
      />
    </form>
  );
}
