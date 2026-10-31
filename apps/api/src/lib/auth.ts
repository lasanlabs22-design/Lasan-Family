import { createMiddleware } from "hono/factory";
import { SignJWT, jwtVerify } from "jose";
import type { Role, SessionUser } from "@lasan/shared";
import { env } from "../env";
import { fail } from "./http";

const key = new TextEncoder().encode(env.JWT_SECRET);
const ISSUER = "lasan-family-api";

export type TokenClaims = { sub: string; role: Role; pid?: string | null };

export async function signSession(user: SessionUser) {
  return new SignJWT({ role: user.role, pid: user.providerId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(user.role === "admin" ? "12h" : "30d")
    .sign(key);
}

async function readToken(header: string | undefined): Promise<TokenClaims | null> {
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), key, { issuer: ISSUER });
    return { sub: payload.sub!, role: payload.role as Role, pid: (payload.pid as string | null) ?? null };
  } catch {
    return null;
  }
}

export type AuthEnv = { Variables: { auth: TokenClaims | null } };

/** Reads the session if present, never rejects. */
export const optionalAuth = createMiddleware<AuthEnv>(async (c, next) => {
  c.set("auth", await readToken(c.req.header("Authorization")));
  await next();
});

/** Rejects unless the caller is signed in with one of the given roles. */
export const requireRole = (...roles: Role[]) =>
  createMiddleware<{ Variables: { auth: TokenClaims } }>(async (c, next) => {
    const claims = await readToken(c.req.header("Authorization"));
    if (!claims) fail(401, "Please sign in");
    if (!roles.includes(claims.role)) fail(403, "You don't have access to this");
    if (claims.role === "provider" && !claims.pid) fail(403, "No service provider profile linked to this account");
    c.set("auth", claims);
    await next();
  });
