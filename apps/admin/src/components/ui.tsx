import type { ReactNode } from "react";
import clsx from "clsx";
import { AlertCircle, Inbox } from "lucide-react";
import { BOOKING_STATUS_LABEL, type BookingStatus, type CityStatus, type ProviderStatus } from "@lasan/shared";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-plum-900">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-plum-700/70">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={clsx("rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgb(42_20_40/0.04)] ring-1 ring-blush-100", className)}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="font-display text-lg font-semibold text-plum-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const BOOKING_TONE: Record<BookingStatus, string> = {
  requested: "bg-peach-100 text-[#8a4b1f] ring-peach-300/60",
  confirmed: "bg-lilac-100 text-plum-700 ring-lilac-300/60",
  active: "bg-sage-100 text-sage-600 ring-sage-300/60",
  completed: "bg-plum-50 text-plum-500 ring-plum-300/50",
  cancelled: "bg-blush-50 text-blush-600 ring-blush-200",
};

export function BookingBadge({ status }: { status: BookingStatus }) {
  return <Pill className={BOOKING_TONE[status]}>{BOOKING_STATUS_LABEL[status]}</Pill>;
}

const PROVIDER_TONE: Record<ProviderStatus, string> = {
  pending: "bg-peach-100 text-[#8a4b1f] ring-peach-300/60",
  active: "bg-sage-100 text-sage-600 ring-sage-300/60",
  suspended: "bg-blush-50 text-blush-600 ring-blush-200",
};

export function ProviderBadge({ status }: { status: ProviderStatus }) {
  return <Pill className={PROVIDER_TONE[status]}>{status[0].toUpperCase() + status.slice(1)}</Pill>;
}

const CITY_TONE: Record<CityStatus, string> = {
  live: "bg-sage-100 text-sage-600 ring-sage-300/60",
  waitlist: "bg-peach-100 text-[#8a4b1f] ring-peach-300/60",
  paused: "bg-plum-50 text-plum-500 ring-plum-300/50",
};

export function CityBadge({ status }: { status: CityStatus }) {
  return <Pill className={CITY_TONE[status]}>{status[0].toUpperCase() + status.slice(1)}</Pill>;
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset", className)}>
      {children}
    </span>
  );
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("overflow-x-auto rounded-[24px] bg-white ring-1 ring-blush-100", className)}>
      <table className="w-full min-w-[720px] text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th scope="col" className={clsx("border-b border-blush-100 bg-ivory px-4 py-3 text-xs font-semibold tracking-wide text-plum-700/60 uppercase first:pl-6 last:pr-6", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={clsx("border-b border-blush-50 px-4 py-3.5 align-middle first:pl-6 last:pr-6", className)}>{children}</td>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] bg-white px-6 py-16 text-center ring-1 ring-blush-100">
      <span className="grid size-12 place-items-center rounded-2xl bg-blush-50 text-blush-500">
        <Inbox className="size-5" />
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-plum-900">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-plum-700/70">{children}</p>}
    </div>
  );
}

export function ErrorNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p role="alert" className={clsx("flex items-start gap-2 rounded-2xl bg-blush-50 px-3.5 py-2.5 text-sm text-blush-600 ring-1 ring-blush-100", className)}>
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton rounded-2xl", className)} />;
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2 rounded-[24px] bg-white p-6 ring-1 ring-blush-100" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-10" />
      ))}
    </div>
  );
}

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-plum-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-400",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-plum-900 ring-1 ring-blush-200 transition hover:bg-blush-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-400",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blush-600 ring-1 ring-blush-200 transition hover:bg-blush-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush-400",
};

export const inputClass =
  "rounded-full bg-white px-4 py-2 text-sm text-plum-900 ring-1 ring-blush-200 outline-none placeholder:text-plum-700/40 transition focus:ring-2 focus:ring-blush-300";

const IST = "Asia/Kolkata";
export const fmtDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T00:00:00+05:30` : iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: IST });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: IST });

/** "+919000000008" → "+91 90000 00008" for display; anything else is shown as stored. */
export const fmtPhone = (p: string) => {
  const m = /^\+91(\d{5})(\d{5})$/.exec(p);
  return m ? `+91 ${m[1]} ${m[2]}` : p;
};
