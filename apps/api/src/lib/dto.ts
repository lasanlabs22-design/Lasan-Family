import { asc, eq, inArray } from "drizzle-orm";
import { stateName, type BookingDTO, type CityDTO, type Frequency, type Need, type ProviderDTO, type StateCode, type Unit, type VisitDTO } from "@lasan/shared";
import { db, schema } from "../db/client";
import { iso } from "./http";

type ProviderRow = typeof schema.providers.$inferSelect;
type BookingRow = typeof schema.bookings.$inferSelect;
type VisitRow = typeof schema.visits.$inferSelect;

/** Small lookup tables, loaded per request (a handful of rows each). */
export async function lookups() {
  const [cityRows, serviceRows] = await Promise.all([db.select().from(schema.cities), db.select().from(schema.services)]);
  return {
    cityName: (slug: string) => cityRows.find((c) => c.slug === slug)?.name ?? slug,
    serviceName: (slug: string) => serviceRows.find((s) => s.slug === slug)?.name ?? slug,
  };
}
type Lookups = Awaited<ReturnType<typeof lookups>>;

export async function listCities(): Promise<CityDTO[]> {
  const [cityRows, locRows] = await Promise.all([
    db.select().from(schema.cities).orderBy(asc(schema.cities.name)),
    db.select().from(schema.localities).orderBy(asc(schema.localities.name)),
  ]);
  return cityRows.map((c) => ({
    slug: c.slug,
    name: c.name,
    state: c.state as StateCode,
    stateName: stateName(c.state as StateCode),
    status: c.status,
    localities: locRows.filter((l) => l.citySlug === c.slug).map((l) => l.name),
  }));
}

export function toProviderDTO(p: ProviderRow, l: Lookups): ProviderDTO {
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    category: p.category,
    serviceSlug: p.serviceSlug,
    citySlug: p.citySlug,
    cityName: l.cityName(p.citySlug),
    locality: p.locality,
    years: p.years,
    rating: p.rating,
    reviews: p.reviews,
    languages: p.languages,
    photo: p.photo,
    rate: p.rate,
    unit: p.unit as Unit,
    bio: p.bio,
  };
}

const providerBrief = (p: ProviderRow | undefined) => (p ? { id: p.id, name: p.name, title: p.title, photo: p.photo, category: p.category } : null);

export async function toBookingDTOs(rows: BookingRow[]): Promise<BookingDTO[]> {
  if (!rows.length) return [];
  const l = await lookups();
  const ids = [...new Set(rows.map((b) => b.providerId).filter(Boolean))] as string[];
  const provs = ids.length ? await db.select().from(schema.providers).where(inArray(schema.providers.id, ids)) : [];
  return rows.map((b) => {
    const p = provs.find((x) => x.id === b.providerId);
    return {
      id: b.id,
      code: b.code,
      status: b.status,
      need: b.need as Need,
      services: b.serviceSlugs.map((slug) => ({ slug, name: l.serviceName(slug) })),
      planSlug: b.planSlug,
      frequency: b.frequency as Frequency,
      startDate: b.startDate,
      slot: b.slot,
      recipientName: b.recipientName,
      forWhom: b.forWhom,
      phone: b.phone,
      citySlug: b.citySlug,
      cityName: l.cityName(b.citySlug),
      locality: b.locality,
      address: b.address,
      food: b.food,
      diets: b.diets,
      notes: b.notes,
      total: b.total,
      provider: p ? { id: p.id, name: p.name, title: p.title, photo: p.photo } : null,
      createdAt: b.createdAt.toISOString(),
    };
  });
}

export async function toVisitDTOs(rows: VisitRow[]): Promise<VisitDTO[]> {
  if (!rows.length) return [];
  const bookingIds = [...new Set(rows.map((v) => v.bookingId))];
  const providerIds = [...new Set(rows.map((v) => v.providerId).filter(Boolean))] as string[];
  const [bks, provs, ups] = await Promise.all([
    db.select({ id: schema.bookings.id, code: schema.bookings.code }).from(schema.bookings).where(inArray(schema.bookings.id, bookingIds)),
    providerIds.length ? db.select().from(schema.providers).where(inArray(schema.providers.id, providerIds)) : Promise.resolve([] as ProviderRow[]),
    db
      .select()
      .from(schema.visitUpdates)
      .where(
        inArray(
          schema.visitUpdates.visitId,
          rows.map((v) => v.id),
        ),
      )
      .orderBy(asc(schema.visitUpdates.createdAt)),
  ]);
  return rows.map((v) => ({
    id: v.id,
    bookingId: v.bookingId,
    bookingCode: bks.find((b) => b.id === v.bookingId)?.code ?? "",
    date: v.date,
    slot: v.slot,
    status: v.status,
    checkInAt: iso(v.checkInAt),
    checkOutAt: iso(v.checkOutAt),
    provider: providerBrief(provs.find((p) => p.id === v.providerId)),
    updates: ups
      .filter((u) => u.visitId === v.id)
      .map((u) => ({ id: u.id, kind: u.kind, title: u.title, detail: u.detail, photoUrl: u.photoUrl, at: u.createdAt.toISOString() })),
  }));
}

export async function getBookingRow(id: string) {
  const [row] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id));
  return row;
}
