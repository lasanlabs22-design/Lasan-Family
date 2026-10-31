import { planBySlug, unsplash, type BookingDTO } from "@lasan/shared";

/** Provider photos are stored as Unsplash ids; visit updates carry full URLs. */
export const photoUri = (photo: string | null | undefined, w = 400) => {
  if (!photo) return undefined;
  return /^https?:\/\//.test(photo) ? photo : unsplash(photo, w, w);
};

const parseDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Today's date in India (YYYY-MM-DD), matching the API's todayIST(). */
export function todayIST(): string {
  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, n: number) {
  const d = parseDay(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export const toISODate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function dayLabel(iso: string) {
  const today = todayIST();
  if (iso === today) return "Today";
  if (iso === addDaysISO(today, 1)) return "Tomorrow";
  return parseDay(iso).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

/** dayLabel for use mid-sentence ("from today", "from Monday, 3 November"). */
export const dayLabelInline = (iso: string) => dayLabel(iso).replace(/^(Today|Tomorrow)$/, (m) => m.toLowerCase());

export const shortDate = (iso: string) => parseDay(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export const timeOf = (isoDateTime: string) =>
  new Date(isoDateTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

export function greeting() {
  const h = new Date(Date.now() + 5.5 * 3600 * 1000).getUTCHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export const firstName = (name?: string | null) => (name ?? "").trim().split(/\s+/)[0] ?? "";

export const formatPhone = (p?: string | null) => {
  if (!p) return "";
  const d = p.replace(/\D/g, "").slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : p;
};

export function bookingTitle(b: Pick<BookingDTO, "planSlug" | "services">) {
  if (b.planSlug) return `${planBySlug(b.planSlug)?.name ?? b.planSlug} plan`;
  return b.services.map((s) => s.name).join(" + ") || "Booking";
}
