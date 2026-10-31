"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ApplicationStage, AuthResponse, BookingStatus, CityStatus, ProviderStatus } from "@lasan/shared";
import { apiMutate } from "./api";
import { API_URL, SESSION_COOKIE, SESSION_MAX_AGE } from "./config";

export type ActionResult = { error?: string; ok?: boolean };
export type LoginState = { error?: string; email?: string };

// ---------- Session ----------

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");
  const fail = (error: string): LoginState => ({ error, email });
  if (!email || !password) return fail("Enter your email and password.");

  let res: Response;
  try {
    res = await fetch(`${API_URL}/v1/auth/admin`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return fail("The Lasan API is unreachable right now. Please try again in a moment.");
  }
  const json = (await res.json().catch(() => null)) as (AuthResponse & { error?: string }) | null;
  if (!res.ok || !json?.token) {
    return fail(res.status === 400 ? "Enter a valid email and a password of at least 6 characters." : (json?.error ?? "Could not sign you in."));
  }
  if (json.user.role !== "admin") return fail("This account does not have admin access.");

  (await cookies()).set(SESSION_COOKIE, json.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  // Only allow same-site relative redirects.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

// ---------- Mutations ----------

async function patch(path: string, body: unknown): Promise<ActionResult> {
  const r = await apiMutate("PATCH", path, body);
  if (!r.ok) return { error: r.error };
  // Every page reads live data; refresh the whole console so tiles, counts and tables agree.
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateBooking(id: string, body: { status?: BookingStatus; providerId?: string | null }) {
  return patch(`/admin/bookings/${encodeURIComponent(id)}`, body);
}

export async function updateProvider(
  id: string,
  body: { status?: ProviderStatus; rate?: number; aadhaarVerified?: boolean; policeVerified?: boolean },
) {
  if (body.rate !== undefined && (!Number.isInteger(body.rate) || body.rate <= 0)) return { error: "Enter a whole rupee amount above zero." };
  return patch(`/admin/providers/${encodeURIComponent(id)}`, body);
}

export async function updateApplication(id: string, stage: ApplicationStage, notes?: string) {
  return patch(`/admin/applications/${encodeURIComponent(id)}`, { stage, ...(notes !== undefined ? { notes } : {}) });
}

export async function updateCity(slug: string, body: { status?: CityStatus; addLocality?: string }) {
  if (body.addLocality !== undefined && body.addLocality.trim().length < 2) return { error: "Locality names need at least 2 characters." };
  return patch(`/admin/cities/${encodeURIComponent(slug)}`, body);
}

export async function updateService(slug: string, body: { price?: number; active?: boolean }) {
  if (body.price !== undefined && (!Number.isInteger(body.price) || body.price <= 0)) return { error: "Enter a whole rupee amount above zero." };
  return patch(`/admin/services/${encodeURIComponent(slug)}`, body);
}
