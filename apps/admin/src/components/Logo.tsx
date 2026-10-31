import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Lasan Family admin home">
      <svg viewBox="0 0 40 40" className="size-8 transition-transform duration-500 group-hover:rotate-[-6deg]" aria-hidden>
        <defs>
          <linearGradient id="lg-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f0a3b4" />
            <stop offset="1" stopColor="#d45677" />
          </linearGradient>
          <linearGradient id="lg-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c9b8f0" />
            <stop offset="1" stopColor="#7a4377" />
          </linearGradient>
        </defs>
        <path d="M20 35C10 28 4 21.5 4 14.5 4 9.3 8 5.5 12.8 5.5c3.1 0 5.7 1.6 7.2 4.1" fill="url(#lg-a)" />
        <path d="M20 35c10-7 16-13.5 16-20.5 0-5.2-4-9-8.8-9-3.1 0-5.7 1.6-7.2 4.1" fill="url(#lg-b)" opacity="0.9" />
        <path d="M13 21.5c2.2 2.6 4.5 3.9 7 3.9s4.8-1.3 7-3.9" stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </svg>
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className="font-display text-xl font-semibold tracking-tight text-plum-900">Lasan</span>
        <span className="text-[0.65rem] font-semibold tracking-[0.22em] text-blush-600 uppercase">Family</span>
      </span>
    </Link>
  );
}
