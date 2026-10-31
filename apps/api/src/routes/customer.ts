import { Hono } from "hono";
import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";
import { updateProfileSchema } from "@lasan/shared";
import { db, schema } from "../db/client";
import { requireRole } from "../lib/auth";
import { toBookingDTOs, toVisitDTOs } from "../lib/dto";
import { fail, parse, todayIST } from "../lib/http";

/** Everything a signed-in customer sees in the app. */
export const customerRoutes = new Hono<{ Variables: { auth: { sub: string } } }>();
customerRoutes.use("*", requireRole("customer"));

customerRoutes.get("/bookings", async (c) => {
  const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.customerId, c.get("auth").sub)).orderBy(desc(schema.bookings.createdAt));
  return c.json(await toBookingDTOs(rows));
});

customerRoutes.get("/bookings/:id", async (c) => {
  const [row] = await db
    .select()
    .from(schema.bookings)
    .where(and(eq(schema.bookings.id, c.req.param("id")), eq(schema.bookings.customerId, c.get("auth").sub)));
  if (!row) fail(404, "Booking not found");
  const [booking] = await toBookingDTOs([row]);
  const visits = await db.select().from(schema.visits).where(eq(schema.visits.bookingId, row.id)).orderBy(asc(schema.visits.date));
  return c.json({ booking, visits: await toVisitDTOs(visits) });
});

customerRoutes.post("/bookings/:id/cancel", async (c) => {
  const [row] = await db
    .select()
    .from(schema.bookings)
    .where(and(eq(schema.bookings.id, c.req.param("id")), eq(schema.bookings.customerId, c.get("auth").sub)));
  if (!row) fail(404, "Booking not found");
  if (row.status === "completed" || row.status === "cancelled") fail(409, "This booking can no longer be cancelled");
  await db.update(schema.bookings).set({ status: "cancelled" }).where(eq(schema.bookings.id, row.id));
  await db
    .update(schema.visits)
    .set({ status: "cancelled" })
    .where(and(eq(schema.visits.bookingId, row.id), eq(schema.visits.status, "scheduled")));
  return c.json({ ok: true });
});

/** Home screen: today's visits with live updates, plus what's next. */
customerRoutes.get("/home", async (c) => {
  const ids = (await db.select({ id: schema.bookings.id }).from(schema.bookings).where(eq(schema.bookings.customerId, c.get("auth").sub))).map((b) => b.id);
  if (!ids.length) return c.json({ today: [], upcoming: [] });
  const today = todayIST();
  const rows = await db
    .select()
    .from(schema.visits)
    .where(and(inArray(schema.visits.bookingId, ids), gte(schema.visits.date, today)))
    .orderBy(asc(schema.visits.date))
    .limit(20);
  const dtos = await toVisitDTOs(rows.filter((v) => v.status !== "cancelled"));
  return c.json({ today: dtos.filter((v) => v.date === today), upcoming: dtos.filter((v) => v.date > today).slice(0, 5) });
});

customerRoutes.patch("/profile", async (c) => {
  const input = parse(updateProfileSchema, await c.req.json());
  const [user] = await db.update(schema.users).set(input).where(eq(schema.users.id, c.get("auth").sub)).returning();
  const { passwordHash: _p, firebaseUid: _f, ...rest } = user;
  return c.json(rest);
});
