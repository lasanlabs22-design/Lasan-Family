import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ApiError } from "@lasan/shared";
import { API_URL, SESSION_COOKIE } from "./config";

const UNREACHABLE = "The Lasan API is unreachable right now. Please try again in a moment.";

export async function getToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/** Sends a request with the signed-in admin's token, or bounces to /login when there is no session. */
async function call(method: string, path: string, body?: unknown): Promise<Response | null> {
  const token = await getToken();
  if (!token) redirect("/login");
  try {
    return await fetch(`${API_URL}/v1${path}`, {
      method,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return null;
  }
}

async function errorMessage(res: Response) {
  const json = (await res.json().catch(() => null)) as ApiError | null;
  return json?.error || `Something went wrong (${res.status}). Please try again.`;
}

/** Per-request read for Server Components (never cached: every page shows live ops data). */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await call("GET", path);
  if (!res) throw new Error(UNREACHABLE);
  if (res.status === 401 || res.status === 403) redirect("/login?expired=1");
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json() as Promise<T>;
}

export type MutationResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

/** Write used by Server Actions. Returns the API's friendly `error` instead of throwing. */
export async function apiMutate<T = unknown>(method: "POST" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<MutationResult<T>> {
  const res = await call(method, path, body);
  if (!res) return { ok: false, error: UNREACHABLE };
  if (res.status === 401) redirect("/login?expired=1");
  if (!res.ok) return { ok: false, error: await errorMessage(res) };
  return { ok: true, data: (await res.json().catch(() => null)) as T };
}
