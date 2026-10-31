import type { Metadata } from "next";
import { Suspense } from "react";
import Aurora from "@/components/graphics/Aurora";
import BookingWizard from "./BookingWizard";

export const metadata: Metadata = { title: "Book care · Nestly" };

export default function BookPage() {
  return (
    <div className="grain relative min-h-screen overflow-hidden">
      <Aurora className="opacity-70" />
      <div className="relative">
        <header className="mx-auto max-w-6xl px-6 pt-32 pb-10 text-center sm:pt-36">
          <h1 className="font-display text-4xl font-medium tracking-tight text-plum-900 sm:text-5xl">
            Let&apos;s find her the <em className="text-gradient">right help</em>
          </h1>
          <p className="mt-3 text-plum-700/70">Takes about two minutes. No payment needed today.</p>
        </header>
        <Suspense fallback={<div className="mx-auto h-[600px] max-w-6xl animate-pulse rounded-[2.25rem] bg-white/60" />}>
          <BookingWizard />
        </Suspense>
      </div>
    </div>
  );
}
