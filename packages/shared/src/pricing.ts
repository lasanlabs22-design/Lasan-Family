import type { PlanSlug, Service } from "./catalog";

export const FREQUENCIES = [
  { id: "once", label: "One visit", mult: 1, discount: 0, note: "Try us out" },
  { id: "week", label: "Daily for a week", mult: 7, discount: 0.05, note: "Save 5%" },
  { id: "month", label: "Monthly", mult: 26, discount: 0.15, note: "Save 15%" },
] as const;

export type Frequency = (typeof FREQUENCIES)[number]["id"];

export const SLOTS = ["Morning · 7–11", "Midday · 11–2", "Evening · 5–8", "Full day · 8–8"] as const;
export type Slot = (typeof SLOTS)[number];

/**
 * Price estimate for a booking. Per-visit / per-day services repeat with the frequency;
 * one-off jobs (deep clean, occasion) and monthly services are charged once.
 * The API recomputes this server-side; clients only display it.
 */
export function quote(input: { services: { price: Service["price"]; unit: string }[]; frequency: Frequency; plan?: { slug: PlanSlug; price: number } | null }) {
  if (input.plan) return input.plan.price;
  const f = FREQUENCIES.find((x) => x.id === input.frequency) ?? FREQUENCIES[0];
  const repeats = (u: string) => u === "visit" || u === "day";
  const recurring = input.services.filter((s) => repeats(s.unit)).reduce((sum, s) => sum + s.price, 0);
  const once = input.services.filter((s) => !repeats(s.unit)).reduce((sum, s) => sum + s.price, 0);
  return Math.round(recurring * f.mult * (1 - f.discount) + once);
}

/** Helpers keep 80% of the booking value; the rest covers verification, insurance, training and support. */
export const PROVIDER_SHARE = 0.8;
