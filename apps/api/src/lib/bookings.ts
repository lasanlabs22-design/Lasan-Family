import { and, eq, inArray } from "drizzle-orm";
import { PLANS, quote, type createBookingSchema } from "@lasan/shared";
import type { z } from "zod";
import { db, schema } from "../db/client";
import { addDays, fail } from "./http";

type Input = z.output<typeof createBookingSchema>;

export function bookingCode() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Array.from({ length: 4 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
  return `LF-${ymd}-${rand}`;
}

/** Validates a booking against live geography and the catalog, and prices it on the server. */
export async function prepareBooking(input: Input) {
  const [city] = await db.select().from(schema.cities).where(eq(schema.cities.slug, input.citySlug));
  if (!city) fail(422, "Unknown city");
  if (city.status !== "live") fail(422, `We're not taking bookings in ${city.name} yet. Join the waitlist and we'll tell you when we launch.`);
  const [loc] = await db
    .select()
    .from(schema.localities)
    .where(and(eq(schema.localities.citySlug, city.slug), eq(schema.localities.name, input.locality)));
  if (!loc) fail(422, `We don't serve ${input.locality} in ${city.name} yet`);

  const plan = input.planSlug ? PLANS.find((p) => p.slug === input.planSlug) : null;
  const services = input.serviceSlugs.length
    ? await db
        .select()
        .from(schema.services)
        .where(and(inArray(schema.services.slug, input.serviceSlugs), eq(schema.services.active, true)))
    : [];
  if (!plan && services.length !== input.serviceSlugs.length) fail(422, "One of the selected services is not available");

  if (input.providerId) {
    const [p] = await db.select().from(schema.providers).where(eq(schema.providers.id, input.providerId));
    if (!p || p.status !== "active") fail(422, "That helper is not available right now");
  }

  const total = quote({ services, frequency: input.frequency, plan: plan ? { slug: plan.slug, price: plan.price } : null });
  const wantsCooking = plan ? plan.need !== "maid" : services.some((s) => s.category === "cook");
  return { city, total, wantsCooking };
}

/** Number of visit days a booking covers. Monthly bookings skip Sundays (26 working days). */
export function visitDates(b: { startDate: string; frequency: string; planSlug: string | null; serviceSlugs: string[] }) {
  const oneOff = b.serviceSlugs.length > 0 && b.serviceSlugs.every((s) => s === "deep-cleaning" || s === "occasion-cook");
  if (oneOff || b.frequency === "once") return [b.startDate];
  const count = b.planSlug || b.frequency === "month" ? 26 : 7;
  const dates: string[] = [];
  for (let i = 0; dates.length < count && i < 40; i++) {
    const d = addDays(b.startDate, i);
    if (count === 26 && new Date(`${d}T00:00:00Z`).getUTCDay() === 0) continue;
    dates.push(d);
  }
  return dates;
}

/** Creates the visit schedule for a booking once a helper is assigned. Idempotent. */
export async function scheduleVisits(bookingId: string) {
  const [b] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId));
  if (!b?.providerId) return;
  const existing = await db.select({ id: schema.visits.id }).from(schema.visits).where(eq(schema.visits.bookingId, b.id));
  if (existing.length) {
    // Re-assignment: move upcoming visits to the new helper.
    await db
      .update(schema.visits)
      .set({ providerId: b.providerId })
      .where(and(eq(schema.visits.bookingId, b.id), eq(schema.visits.status, "scheduled")));
    return;
  }
  const dates = visitDates(b);
  const amount = Math.round(b.total / dates.length);
  await db.insert(schema.visits).values(dates.map((date) => ({ bookingId: b.id, providerId: b.providerId, date, slot: b.slot, amount })));
}
