import { Hono } from "hono";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { PLANS, applicationSchema, createBookingSchema, leadSchema, type ServiceDTO, type Unit } from "@lasan/shared";
import { db, schema } from "../db/client";
import { optionalAuth, type AuthEnv } from "../lib/auth";
import { bookingCode, prepareBooking } from "../lib/bookings";
import { listCities, lookups, toBookingDTOs, toProviderDTO } from "../lib/dto";
import { fail, parse } from "../lib/http";

export const publicRoutes = new Hono<AuthEnv>();

publicRoutes.get("/cities", async (c) => c.json(await listCities()));

publicRoutes.get("/services", async (c) => {
  const rows = await db.select().from(schema.services).where(eq(schema.services.active, true)).orderBy(asc(schema.services.sort));
  return c.json(rows.map(({ sort: _sort, ...s }) => ({ ...s, unit: s.unit as Unit })) satisfies ServiceDTO[]);
});

publicRoutes.get("/plans", (c) => c.json(PLANS));

publicRoutes.get("/providers", async (c) => {
  const { city, category, q } = c.req.query();
  const where = [eq(schema.providers.status, "active")];
  if (city) where.push(eq(schema.providers.citySlug, city));
  if (category === "maid" || category === "cook") where.push(eq(schema.providers.category, category));
  if (q?.trim()) {
    const like = `%${q.trim()}%`;
    where.push(or(ilike(schema.providers.name, like), ilike(schema.providers.title, like), ilike(schema.providers.bio, like), sql`${schema.providers.languages}::text ILIKE ${like}`)!);
  }
  const rows = await db
    .select()
    .from(schema.providers)
    .where(and(...where))
    .orderBy(desc(schema.providers.rating), desc(schema.providers.reviews));
  const l = await lookups();
  return c.json(rows.map((p) => toProviderDTO(p, l)));
});

publicRoutes.get("/providers/:id", async (c) => {
  const [p] = await db
    .select()
    .from(schema.providers)
    .where(and(eq(schema.providers.id, c.req.param("id")), eq(schema.providers.status, "active")));
  if (!p) fail(404, "Helper not found");
  return c.json(toProviderDTO(p, await lookups()));
});

/** Website and app bookings. Guests are attached to a customer account by phone, so the booking shows up when they sign in to the app. */
publicRoutes.post("/bookings", optionalAuth, async (c) => {
  const input = parse(createBookingSchema, await c.req.json());
  const { total, wantsCooking } = await prepareBooking(input);
  const auth = c.get("auth");

  let customerId = auth?.role === "customer" ? auth.sub : null;
  if (!customerId) {
    const [existing] = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.role, "customer"), eq(schema.users.phone, input.phone)));
    customerId =
      existing?.id ??
      (
        await db
          .insert(schema.users)
          .values({ role: "customer", phone: input.phone, name: input.forWhom === "Myself" ? input.recipientName : "", citySlug: input.citySlug, locality: input.locality, address: input.address })
          .returning({ id: schema.users.id })
      )[0].id;
  }

  const [row] = await db
    .insert(schema.bookings)
    .values({
      code: bookingCode(),
      customerId,
      need: input.need,
      serviceSlugs: input.planSlug ? [] : input.serviceSlugs,
      planSlug: input.planSlug ?? null,
      frequency: input.planSlug ? "month" : input.frequency,
      startDate: input.startDate,
      slot: input.slot,
      recipientName: input.recipientName,
      forWhom: input.forWhom,
      phone: input.phone,
      citySlug: input.citySlug,
      locality: input.locality,
      address: input.address,
      food: wantsCooking ? (input.food ?? null) : null,
      diets: wantsCooking ? input.diets : [],
      notes: input.notes,
      total,
      requestedProviderId: input.providerId ?? null,
    })
    .returning();
  const [dto] = await toBookingDTOs([row]);
  return c.json(dto, 201);
});

publicRoutes.post("/leads", async (c) => {
  const input = parse(leadSchema, await c.req.json());
  const [row] = await db.insert(schema.leads).values(input).returning({ id: schema.leads.id });
  return c.json({ id: row.id }, 201);
});

publicRoutes.post("/applications", async (c) => {
  const input = parse(applicationSchema, await c.req.json());
  const [city] = await db.select().from(schema.cities).where(eq(schema.cities.slug, input.citySlug));
  if (!city) fail(422, "Unknown city");
  const [dupe] = await db.select({ id: schema.applications.id }).from(schema.applications).where(eq(schema.applications.phone, input.phone));
  if (dupe) fail(409, "We already have an application from this number. Our team will call you soon.");
  const [row] = await db.insert(schema.applications).values(input).returning({ id: schema.applications.id });
  return c.json({ id: row.id }, 201);
});
