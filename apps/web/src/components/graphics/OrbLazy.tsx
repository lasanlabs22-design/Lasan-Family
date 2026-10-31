"use client";

import dynamic from "next/dynamic";

// WebGL only runs in the browser; the CSS gradient underneath doubles as placeholder and fallback.
const Orb = dynamic(() => import("./Orb"), { ssr: false });

export default function OrbLazy({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-peach-100),var(--color-blush-200)_45%,var(--color-lilac-300)_80%)] blur-2xl" />
      <div className="absolute inset-0">
        <Orb />
      </div>
    </div>
  );
}
