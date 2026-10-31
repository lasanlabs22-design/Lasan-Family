/**
 * API smoke test for the mobile app flows, using the same shared client the app uses.
 *   API_URL=https://api-production-05746.up.railway.app npx tsx apps/mobile/scripts/smoke.ts
 * Signs in with the demo accounts (OTP 123456), reads the customer home, creates and cancels a
 * booking, and runs a provider check-in → update → (optional) check-out round trip on today's visit.
 * Set SMOKE_CHECKOUT=1 to also check out (it completes the visit, so leave it off against production).
 */
import { createApiClient, quote, SERVICES, type AuthResponse, type BookingDTO, type VisitDTO } from "@lasan/shared";

const base = (process.env.API_URL || "https://api-production-05746.up.railway.app").replace(/\/$/, "") + "/v1";
let token: string | null = null;
const api = createApiClient({ baseUrl: base, getToken: () => token });
const ok = (msg: string) => console.log(`✔ ${msg}`);

type Job = VisitDTO & { job: { recipientName: string; address: string } };

async function main() {
  const cfg = await api.get<{ firebase: boolean; devMode: boolean; demo: boolean }>("/auth/config");
  ok(`auth/config ${JSON.stringify(cfg)}`);

  // Customer
  const c = await api.post<AuthResponse>("/auth/dev", { phone: "+919000000001", role: "customer", code: "123456" });
  token = c.token;
  ok(`customer login: ${c.user.name} (${c.user.role})`);
  const home = await api.get<{ today: VisitDTO[]; upcoming: VisitDTO[] }>("/me/home");
  ok(`/me/home: ${home.today.length} today, ${home.upcoming.length} upcoming; updates today: ${home.today.reduce((n, v) => n + v.updates.length, 0)}`);
  const bookings = await api.get<BookingDTO[]>("/me/bookings");
  ok(`/me/bookings: ${bookings.length}`);

  const svc = SERVICES.find((s) => s.slug === "daily-maid")!;
  const expected = quote({ services: [svc], frequency: "once" });
  const start = new Date(Date.now() + 5.5 * 3600e3 + 3 * 864e5).toISOString().slice(0, 10);
  const created = await api.post<BookingDTO>("/bookings", {
    need: "maid",
    serviceSlugs: ["daily-maid"],
    planSlug: null,
    frequency: "once",
    startDate: start,
    slot: "Morning · 7–11",
    citySlug: "tirupati",
    locality: "Korlagunta",
    address: "Smoke test (auto-cancelled)",
    forWhom: "Myself",
    recipientName: "Smoke Test",
    phone: "+919000000001",
    food: null,
    diets: [],
    notes: "Automated mobile smoke test. Cancelled immediately.",
  });
  ok(`POST /bookings: ${created.code} total ${created.total} (quote() ${expected})${created.total === expected ? "" : "  ✘ MISMATCH"}`);
  const detail = await api.get<{ booking: BookingDTO; visits: VisitDTO[] }>(`/me/bookings/${created.id}`);
  ok(`/me/bookings/:id → ${detail.booking.status}, ${detail.visits.length} visits`);
  await api.post(`/me/bookings/${created.id}/cancel`);
  const after = await api.get<{ booking: BookingDTO }>(`/me/bookings/${created.id}`);
  ok(`cancel → ${after.booking.status}`);

  // Provider
  const p = await api.post<AuthResponse>("/auth/dev", { phone: "+919000000101", role: "provider", code: "123456" });
  token = p.token;
  ok(`provider login: ${p.user.name} (${p.user.role})`);
  const me = await api.get<{ name: string; aadhaarVerified: boolean; policeVerified: boolean }>("/provider/me");
  ok(`/provider/me: ${me.name}, aadhaar ${me.aadhaarVerified}, police ${me.policeVerified}`);
  const today = await api.get<Job[]>("/provider/visits?range=today");
  ok(`/provider/visits today: ${today.map((v) => `${v.job.recipientName}=${v.status}`).join(", ") || "none"}`);
  const upcoming = await api.get<Job[]>("/provider/visits?range=upcoming");
  ok(`/provider/visits upcoming: ${upcoming.length}`);

  const scheduled = today.find((v) => v.status === "scheduled");
  if (scheduled) {
    await api.post(`/provider/visits/${scheduled.id}/check-in`);
    ok(`check-in ${scheduled.job.recipientName}`);
  }
  const live = scheduled ?? today.find((v) => v.status === "in_progress");
  if (live) {
    const u = await api.post<{ id: string; title: string }>(`/provider/visits/${live.id}/updates`, { kind: "note", title: "App smoke test update", detail: "Posted by the mobile smoke test" });
    ok(`posted update "${u.title}"`);
    if (process.env.SMOKE_CHECKOUT === "1") {
      await api.post(`/provider/visits/${live.id}/check-out`);
      ok("check-out");
    }
    // The family sees it:
    token = c.token;
    const h2 = await api.get<{ today: VisitDTO[] }>("/me/home");
    const seen = h2.today.some((v) => v.updates.some((x) => x.id === u.id));
    ok(`customer timeline shows the update: ${seen}`);
    token = p.token;
  }
  const earnings = await api.get<{ thisWeek: number; thisMonth: number; visitsThisMonth: number; payouts: unknown[] }>("/provider/earnings");
  ok(`/provider/earnings: week ${earnings.thisWeek}, month ${earnings.thisMonth}, ${earnings.payouts.length} payouts`);

  // Errors are friendly
  try {
    await api.post("/auth/dev", { phone: "+919000000001", role: "provider", code: "123456" });
  } catch (e) {
    ok(`provider login with a customer number → "${(e as Error).message}"`);
  }
}

main().catch((e) => {
  console.error("✘", e?.status ?? "", e?.message ?? e);
  process.exit(1);
});
