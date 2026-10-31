import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { adminLoginSchema, devLoginSchema, firebaseLoginSchema, type AuthResponse, type SessionUser } from "@lasan/shared";
import { db, schema } from "../db/client";
import { env } from "../env";
import { requireRole, signSession } from "../lib/auth";
import { firebaseEnabled, verifyFirebasePhoneToken } from "../lib/firebase";
import { fail, parse } from "../lib/http";

export const authRoutes = new Hono();

type UserRow = typeof schema.users.$inferSelect;

async function sessionFor(user: UserRow): Promise<AuthResponse> {
  let providerId: string | null = null;
  if (user.role === "provider") {
    const [p] = await db.select({ id: schema.providers.id }).from(schema.providers).where(eq(schema.providers.userId, user.id));
    providerId = p?.id ?? null;
  }
  const session: SessionUser = { id: user.id, role: user.role, name: user.name, phone: user.phone, email: user.email, providerId };
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  return { token: await signSession(session), user: session };
}

/** Finds or creates the account for a verified phone. Providers must already be onboarded by the ops team. */
async function phoneLogin(phone: string, role: "customer" | "provider", firebaseUid?: string) {
  if (role === "provider") {
    const [prov] = await db.select().from(schema.providers).where(eq(schema.providers.phone, phone));
    if (!prov) fail(403, "This number isn't registered as a Lasan Family service provider. Apply to join on our website.");
    if (prov.status === "suspended") fail(403, "Your provider account is on hold. Please call your Lasan Family coordinator.");
    let [user] = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.role, "provider"), eq(schema.users.phone, phone)));
    if (!user) [user] = await db.insert(schema.users).values({ role: "provider", phone, name: prov.name, firebaseUid }).returning();
    if (prov.userId !== user.id) await db.update(schema.providers).set({ userId: user.id }).where(eq(schema.providers.id, prov.id));
    return sessionFor(user);
  }
  let [user] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.role, "customer"), eq(schema.users.phone, phone)));
  if (!user) [user] = await db.insert(schema.users).values({ role: "customer", phone, firebaseUid }).returning();
  else if (firebaseUid && !user.firebaseUid) await db.update(schema.users).set({ firebaseUid }).where(eq(schema.users.id, user.id));
  return sessionFor(user);
}

/** Tells clients which sign-in methods are available. */
authRoutes.get("/config", (c) => c.json({ firebase: firebaseEnabled, devMode: env.AUTH_DEV_MODE, demo: env.DEMO_PHONES.length > 0 }));

authRoutes.post("/firebase", async (c) => {
  const { idToken, role } = parse(firebaseLoginSchema, await c.req.json());
  const { uid, phone } = await verifyFirebasePhoneToken(idToken);
  return c.json(await phoneLogin(phone, role, uid));
});

/** Fixed-OTP sign-in: any phone in dev mode, or only the configured demo accounts in production. */
authRoutes.post("/dev", async (c) => {
  if (!env.AUTH_DEV_MODE && !env.DEMO_PHONES.length) fail(404, "Not found");
  const { phone, role, code } = parse(devLoginSchema, await c.req.json());
  if (!env.AUTH_DEV_MODE && !env.DEMO_PHONES.includes(phone)) fail(403, "Use the OTP sent to your phone to sign in.");
  if (code !== "123456") fail(401, "Wrong OTP. For demo accounts the code is 123456.");
  return c.json(await phoneLogin(phone, role));
});

authRoutes.post("/admin", async (c) => {
  const { email, password } = parse(adminLoginSchema, await c.req.json());
  const [user] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.role, "admin"), eq(schema.users.email, email.toLowerCase())));
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) fail(401, "Wrong email or password");
  return c.json(await sessionFor(user));
});

authRoutes.get("/me", requireRole("customer", "provider", "admin"), async (c) => {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, c.get("auth").sub));
  if (!user) fail(401, "Please sign in again");
  const { passwordHash: _p, firebaseUid: _f, ...rest } = user;
  return c.json({ ...rest, providerId: c.get("auth").pid ?? null });
});
