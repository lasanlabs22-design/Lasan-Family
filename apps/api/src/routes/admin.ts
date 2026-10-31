import { Hono } from "hono";
import { and, asc, count, desc, eq, gte, ilike, inArray, ne, notInArray, or, sum } from "drizzle-orm";
import {
  adminApplicationPatchSchema,
  adminBookingPatchSchema,
  adminCityPatchSchema,
  adminProviderPatchSchema,
  adminServicePatchSchema,
  BOOKING_STATUSES,
  type AdminOverviewDTO,
  type AdminProviderDTO,
  type ApplicationDTO,
  type BookingStatus,
  type CustomerDTO,
  type StateCode,
} from "@lasan/shared";
import { db, schema } from "../db/client";
import { requireRole } from "../lib/auth";
import { scheduleVisits } from "../lib/bookings";
import { listCities, lookups, toBookingDTOs, toProviderDTO } from "../lib/dto";
import { addDays, fail, parse, todayIST } from "../lib/http";

export const adminRoutes = new Hono();
adminRoutes.use("*", requireRole("admin"));

const { bookings, providers, applications, users, cities, localities, services, leads } = schema;

adminRoutes.get("/overview", async (c) => {
  const since = new Date(`${addDays(todayIST(), -29)}T00:00:00+05:30`);
  const recent = await db
    .select()
    .from(bookings)
    .where(and(gte(bookings.createdAt, since), ne(bookings.status, "cancelled")));
  const [[activeProv], [pendingApps], cityRows, [leadCount], provByCity, latest] = await Promise.all([
    db.select({ n: count() }).from(providers).where(eq(providers.status, "active")),
    db
      .select({ n: count() })
      .from(applications)
      .where(notInArray(applications.stage, ["approved", "rejected"])),
    db.select().from(cities),
    db.select({ n: count() }).from(leads),
    db.select({ city: providers.citySlug, n: count() }).from(providers).where(eq(providers.status, "active")).groupBy(providers.citySlug),
    db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(8),
  ]);

  const istDate = (d: Date) => new Date(d.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
  const daily = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(todayIST(), i - 29);
    const day = recent.filter((b) => istDate(b.createdAt) === date);
    return { date, bookings: day.length, revenue: day.reduce((s, b) => s + b.total, 0) };
  });

  const byCity = cityRows
    .filter((ct) => ct.status === "live")
    .map((ct) => {
      const bs = recent.filter((b) => b.citySlug === ct.slug);
      return {
        citySlug: ct.slug,
        cityName: ct.name,
        state: ct.state as StateCode,
        bookings: bs.length,
        revenue: bs.reduce((s, b) => s + b.total, 0),
        providers: provByCity.find((p) => p.city === ct.slug)?.n ?? 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return c.json({
    kpis: {
      bookings30d: recent.length,
      revenue30d: recent.reduce((s, b) => s + b.total, 0),
      activeProviders: activeProv.n,
      pendingApplications: pendingApps.n,
      liveCities: cityRows.filter((ct) => ct.status === "live").length,
      waitlistLeads: leadCount.n,
    },
    byCity,
    daily,
    recentBookings: await toBookingDTOs(latest),
  } satisfies AdminOverviewDTO);
});

// ---------- Bookings ----------

adminRoutes.get("/bookings", async (c) => {
  const { status, city, q } = c.req.query();
  const where = [];
  if (status && (BOOKING_STATUSES as readonly string[]).includes(status)) where.push(eq(bookings.status, status as BookingStatus));
  if (city) where.push(eq(bookings.citySlug, city));
  if (q?.trim()) {
    const like = `%${q.trim()}%`;
    where.push(or(ilike(bookings.code, like), ilike(bookings.recipientName, like), ilike(bookings.phone, like), ilike(bookings.locality, like))!);
  }
  const rows = await db
    .select()
    .from(bookings)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(bookings.createdAt))
    .limit(300);
  return c.json(await toBookingDTOs(rows));
});

adminRoutes.patch("/bookings/:id", async (c) => {
  const input = parse(adminBookingPatchSchema, await c.req.json());
  const [b] = await db.select().from(bookings).where(eq(bookings.id, c.req.param("id")));
  if (!b) fail(404, "Booking not found");

  const patch: Partial<typeof bookings.$inferInsert> = {};
  if (input.providerId !== undefined) {
    if (input.providerId) {
      const [p] = await db.select().from(providers).where(eq(providers.id, input.providerId));
      if (!p || p.status !== "active") fail(422, "Pick an active helper");
      if (p.citySlug !== b.citySlug) fail(422, "This helper works in a different city");
    }
    patch.providerId = input.providerId;
    if (input.providerId && b.status === "requested" && !input.status) patch.status = "confirmed";
  }
  if (input.status) {
    if ((input.status === "confirmed" || input.status === "active") && !(patch.providerId ?? b.providerId)) fail(422, "Assign a helper before confirming");
    patch.status = input.status;
  }
  const [row] = await db.update(bookings).set(patch).where(eq(bookings.id, b.id)).returning();

  if (row.status === "cancelled") {
    await db
      .update(schema.visits)
      .set({ status: "cancelled" })
      .where(and(eq(schema.visits.bookingId, row.id), eq(schema.visits.status, "scheduled")));
  } else if (row.providerId) {
    await scheduleVisits(row.id);
  }
  return c.json((await toBookingDTOs([row]))[0]);
});

// ---------- Providers ----------

adminRoutes.get("/providers", async (c) => {
  const { status, city, q } = c.req.query();
  const where = [];
  if (status === "pending" || status === "active" || status === "suspended") where.push(eq(providers.status, status));
  if (city) where.push(eq(providers.citySlug, city));
  if (q?.trim()) where.push(or(ilike(providers.name, `%${q.trim()}%`), ilike(providers.phone, `%${q.trim()}%`))!);
  const [rows, active, l] = await Promise.all([
    db
      .select()
      .from(providers)
      .where(where.length ? and(...where) : undefined)
      .orderBy(asc(providers.name)),
    db
      .select({ pid: bookings.providerId, n: count() })
      .from(bookings)
      .where(inArray(bookings.status, ["confirmed", "active"]))
      .groupBy(bookings.providerId),
    lookups(),
  ]);
  return c.json(
    rows.map((p) => ({
      ...toProviderDTO(p, l),
      phone: p.phone,
      status: p.status,
      aadhaarVerified: p.aadhaarVerified,
      policeVerified: p.policeVerified,
      activeBookings: active.find((a) => a.pid === p.id)?.n ?? 0,
      joinedAt: p.createdAt.toISOString(),
    })) satisfies AdminProviderDTO[],
  );
});

adminRoutes.patch("/providers/:id", async (c) => {
  const input = parse(adminProviderPatchSchema, await c.req.json());
  const [cur] = await db.select().from(providers).where(eq(providers.id, c.req.param("id")));
  if (!cur) fail(404, "Helper not found");
  const next = { ...cur, ...input };
  if (next.status === "active" && !(next.aadhaarVerified && next.policeVerified)) fail(422, "Complete Aadhaar and police verification before activating");
  await db.update(providers).set(input).where(eq(providers.id, cur.id));
  return c.json({ ok: true });
});

// ---------- Applications (helper onboarding pipeline) ----------

adminRoutes.get("/applications", async (c) => {
  const stage = c.req.query("stage");
  const rows = await db
    .select()
    .from(applications)
    .where(stage ? eq(applications.stage, stage as ApplicationDTO["stage"]) : undefined)
    .orderBy(desc(applications.createdAt));
  const l = await lookups();
  return c.json(
    rows.map((a) => ({
      id: a.id,
      name: a.name,
      phone: a.phone,
      citySlug: a.citySlug,
      cityName: l.cityName(a.citySlug),
      locality: a.locality,
      experience: a.experience,
      skills: a.skills,
      languages: a.languages,
      stage: a.stage,
      notes: a.notes,
      createdAt: a.createdAt.toISOString(),
    })) satisfies ApplicationDTO[],
  );
});

adminRoutes.patch("/applications/:id", async (c) => {
  const input = parse(adminApplicationPatchSchema, await c.req.json());
  const [a] = await db.select().from(applications).where(eq(applications.id, c.req.param("id")));
  if (!a) fail(404, "Application not found");

  let providerId = a.providerId;
  if (input.stage === "approved" && !providerId) {
    // Approval means documents and the skills session are done: create an active provider profile.
    const [svc] = await db.select().from(services).where(eq(services.slug, a.skills[0] ?? "daily-maid"));
    if (!svc) fail(422, "The applicant's first skill is not a known service");
    const years = { "0": 0, "1-3": 2, "3-7": 5, "7+": 8 }[a.experience] ?? 1;
    const [existing] = await db.select().from(providers).where(eq(providers.phone, a.phone));
    providerId =
      existing?.id ??
      (
        await db
          .insert(providers)
          .values({
            name: a.name,
            phone: a.phone,
            title: svc.name,
            category: svc.category,
            serviceSlug: svc.slug,
            citySlug: a.citySlug,
            locality: a.locality,
            years,
            languages: a.languages,
            rate: svc.price,
            unit: svc.unit,
            status: "active",
            aadhaarVerified: true,
            policeVerified: true,
          })
          .returning({ id: providers.id })
      )[0].id;
  }
  await db
    .update(applications)
    .set({ stage: input.stage, notes: input.notes ?? a.notes, providerId })
    .where(eq(applications.id, a.id));
  return c.json({ ok: true, providerId });
});

// ---------- Customers ----------

adminRoutes.get("/customers", async (c) => {
  const q = c.req.query("q")?.trim();
  const [rows, stats, l] = await Promise.all([
    db
      .select()
      .from(users)
      .where(and(eq(users.role, "customer"), q ? or(ilike(users.name, `%${q}%`), ilike(users.phone, `%${q}%`)) : undefined))
      .orderBy(desc(users.createdAt))
      .limit(300),
    db
      .select({ cid: bookings.customerId, n: count(), ltv: sum(bookings.total) })
      .from(bookings)
      .where(ne(bookings.status, "cancelled"))
      .groupBy(bookings.customerId),
    lookups(),
  ]);
  return c.json(
    rows.map((u) => {
      const s = stats.find((x) => x.cid === u.id);
      return {
        id: u.id,
        name: u.name || "Unnamed",
        phone: u.phone ?? "",
        cityName: u.citySlug ? l.cityName(u.citySlug) : null,
        bookings: s?.n ?? 0,
        lifetimeValue: Number(s?.ltv ?? 0),
        createdAt: u.createdAt.toISOString(),
      };
    }) satisfies CustomerDTO[],
  );
});

// ---------- Geography ----------

adminRoutes.get("/cities", async (c) => {
  const [list, counts] = await Promise.all([
    listCities(),
    db.select({ city: bookings.citySlug, n: count() }).from(bookings).groupBy(bookings.citySlug),
  ]);
  const leadCounts = await db
    .select({ city: leads.city, n: count() })
    .from(leads)
    .groupBy(leads.city);
  return c.json(
    list.map((ct) => ({
      ...ct,
      bookings: counts.find((x) => x.city === ct.slug)?.n ?? 0,
      leads: leadCounts.find((x) => x.city.toLowerCase() === ct.name.toLowerCase())?.n ?? 0,
    })),
  );
});

adminRoutes.patch("/cities/:slug", async (c) => {
  const input = parse(adminCityPatchSchema, await c.req.json());
  const [ct] = await db.select().from(cities).where(eq(cities.slug, c.req.param("slug")));
  if (!ct) fail(404, "City not found");
  if (input.addLocality) await db.insert(localities).values({ citySlug: ct.slug, name: input.addLocality }).onConflictDoNothing();
  if (input.status) {
    if (input.status === "live") {
      const [{ n }] = await db.select({ n: count() }).from(localities).where(eq(localities.citySlug, ct.slug));
      if (!n && !input.addLocality) fail(422, "Add at least one locality before going live");
    }
    await db.update(cities).set({ status: input.status }).where(eq(cities.slug, ct.slug));
  }
  return c.json((await listCities()).find((x) => x.slug === ct.slug));
});

// ---------- Catalog ----------

adminRoutes.get("/services", async (c) => c.json(await db.select().from(services).orderBy(asc(services.sort))));

adminRoutes.patch("/services/:slug", async (c) => {
  const input = parse(adminServicePatchSchema, await c.req.json());
  const [row] = await db.update(services).set(input).where(eq(services.slug, c.req.param("slug"))).returning();
  if (!row) fail(404, "Service not found");
  return c.json(row);
});

// ---------- Leads ----------

adminRoutes.get("/leads", async (c) => {
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(500);
  return c.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});
