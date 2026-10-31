import { HTTPException } from "hono/http-exception";
import type { z } from "zod";

export function fail(status: 400 | 401 | 403 | 404 | 409 | 422 | 500, message: string, issues?: { path: string; message: string }[]): never {
  throw new HTTPException(status, { res: Response.json({ error: message, ...(issues ? { issues } : {}) }, { status }) });
}

export function parse<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const r = schema.safeParse(data);
  if (!r.success) {
    fail(
      422,
      r.error.issues[0]?.message ?? "Invalid request",
      r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    );
  }
  return r.data;
}

/** Calendar date in India (IST), as YYYY-MM-DD. */
export function todayIST(offsetDays = 0) {
  return new Date(Date.now() + 5.5 * 3600_000 + offsetDays * 86400_000).toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const iso = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString() : null);
