import { Hono } from "hono";
import { and, asc, desc, eq, gt, gte, inArray, lt, lte } from "drizzle-orm";
import { PROVIDER_SHARE, visitUpdateSchema, type ProviderEarningsDTO } from "@lasan/shared";
import { db, schema } from "../db/client";
import { requireRole, type TokenClaims } from "../lib/auth";
import { lookups, toProviderDTO, toVisitDTOs } from "../lib/dto";
import { addDays, fail, parse, todayIST } from "../lib/http";

/** The service-provider side of the app: jobs, check-in/out, updates for the family, earnings. */
export const providerRoutes = new Hono<{ Variables: { auth: TokenClaims } }>();
providerRoutes.use("*", requireRole("provider"));

const pid = (c: { get: (k: "auth") => TokenClaims }) => c.get("auth").pid!;

providerRoutes.get("/me", async (c) => {
  const [p] = await db.select().from(schema.providers).where(eq(schema.providers.id, pid(c)));
  if (!p) fail(404, "Profile not found");
  return c.json({ ...toProviderDTO(p, await lookups()), status: p.status, aadhaarVerified: p.aadhaarVerified, policeVerified: p.policeVerified });
});

providerRoutes.get("/visits", async (c) => {
  const range = c.req.query("range") ?? "today";
  const today = todayIST();
  const mine = eq(schema.visits.providerId, pid(c));
  const where =
    range === "today"
      ? and(mine, eq(schema.visits.date, today))
      : range === "upcoming"
        ? and(mine, gt(schema.visits.date, today), lte(schema.visits.date, addDays(today, 14)))
        : and(mine, lt(schema.visits.date, today), gte(schema.visits.date, addDays(today, -30)));
  const rows = await db
    .select()
    .from(schema.visits)
    .where(where)
    .orderBy(range === "past" ? desc(schema.visits.date) : asc(schema.visits.date));

  // Providers need the address and care notes for each job.
  const visits = await toVisitDTOs(rows.filter((v) => v.status !== "cancelled"));
  const bookingIds = [...new Set(rows.map((v) => v.bookingId))];
  const bks = bookingIds.length ? await db.select().from(schema.bookings).where(inArray(schema.bookings.id, bookingIds)) : [];
  const l = await lookups();
  return c.json(
    visits.map((v) => {
      const b = bks.find((x) => x.id === v.bookingId)!;
      return {
        ...v,
        job: {
          recipientName: b.recipientName,
          phone: b.phone,
          address: `${b.address}, ${b.locality}, ${l.cityName(b.citySlug)}`,
          services: b.planSlug ? [`${b.planSlug} plan`] : b.serviceSlugs.map(l.serviceName),
          food: b.food,
          diets: b.diets,
          notes: b.notes,
        },
      };
    }),
  );
});

async function myVisit(visitId: string, providerId: string) {
  const [v] = await db
    .select()
    .from(schema.visits)
    .where(and(eq(schema.visits.id, visitId), eq(schema.visits.providerId, providerId)));
  if (!v) fail(404, "Visit not found");
  return v;
}

providerRoutes.post("/visits/:id/check-in", async (c) => {
  const v = await myVisit(c.req.param("id"), pid(c));
  if (v.status !== "scheduled") fail(409, "This visit has already started");
  if (v.date !== todayIST()) fail(409, "You can only check in on the day of the visit");
  await db.update(schema.visits).set({ status: "in_progress", checkInAt: new Date() }).where(eq(schema.visits.id, v.id));
  await db.insert(schema.visitUpdates).values({ visitId: v.id, kind: "check_in", title: "Checked in at home" });
  await db.update(schema.bookings).set({ status: "active" }).where(and(eq(schema.bookings.id, v.bookingId), eq(schema.bookings.status, "confirmed")));
  return c.json((await toVisitDTOs([{ ...v, status: "in_progress", checkInAt: new Date() }]))[0]);
});

providerRoutes.post("/visits/:id/check-out", async (c) => {
  const v = await myVisit(c.req.param("id"), pid(c));
  if (v.status !== "in_progress") fail(409, "Check in before checking out");
  await db.update(schema.visits).set({ status: "done", checkOutAt: new Date() }).where(eq(schema.visits.id, v.id));
  await db.insert(schema.visitUpdates).values({ visitId: v.id, kind: "check_out", title: "Visit complete, checked out" });
  return c.json({ ok: true });
});

providerRoutes.post("/visits/:id/updates", async (c) => {
  const v = await myVisit(c.req.param("id"), pid(c));
  if (v.status !== "in_progress") fail(409, "Check in first to post updates");
  const input = parse(visitUpdateSchema, await c.req.json());
  const [u] = await db
    .insert(schema.visitUpdates)
    .values({ visitId: v.id, ...input, photoUrl: input.photoUrl ?? null })
    .returning();
  return c.json({ id: u.id, kind: u.kind, title: u.title, detail: u.detail, photoUrl: u.photoUrl, at: u.createdAt.toISOString() }, 201);
});

providerRoutes.get("/earnings", async (c) => {
  const today = todayIST();
  const rows = await db
    .select({ date: schema.visits.date, amount: schema.visits.amount })
    .from(schema.visits)
    .where(and(eq(schema.visits.providerId, pid(c)), eq(schema.visits.status, "done"), gte(schema.visits.date, addDays(today, -60))));
  const share = (xs: typeof rows) => Math.round(xs.reduce((s, v) => s + v.amount, 0) * PROVIDER_SHARE);
  const month = rows.filter((v) => v.date.slice(0, 7) === today.slice(0, 7));
  const week = rows.filter((v) => v.date > addDays(today, -7));

  // Weekly payouts every Monday for the previous week's visits.
  const payouts: ProviderEarningsDTO["payouts"] = [];
  for (let w = 0; w < 6; w++) {
    const end = addDays(today, -7 * w);
    const start = addDays(end, -7);
    const amount = share(rows.filter((v) => v.date > start && v.date <= end));
    if (amount > 0) payouts.push({ date: end, amount, status: w === 0 ? "scheduled" : "paid" });
  }
  return c.json({ thisWeek: share(week), thisMonth: share(month), visitsThisMonth: month.length, payouts } satisfies ProviderEarningsDTO);
});
