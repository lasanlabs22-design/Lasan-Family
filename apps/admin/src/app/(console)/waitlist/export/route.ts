import type { LeadDTO } from "@lasan/shared";
import { API_URL } from "@/lib/config";
import { getToken } from "@/lib/api";

/** Quotes a CSV cell and neutralises spreadsheet formulas (=, +, -, @); E.164 phone numbers stay as they are. */
const cell = (raw: string) => {
  const v = /^[=+\-@]/.test(raw) && !/^\+\d{8,15}$/.test(raw) ? `'${raw}` : raw;
  return /[",\n\r']/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};

/** CSV export of the waitlist, grouped by city (city A to Z, newest first within a city). */
export async function GET() {
  const token = await getToken();
  if (!token) return new Response("Please sign in", { status: 401 });
  let res: Response;
  try {
    res = await fetch(`${API_URL}/v1/admin/leads`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  } catch {
    return new Response("The Lasan API is unreachable right now. Please try again in a moment.", { status: 502 });
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return new Response(body?.error ?? "Could not export the waitlist", { status: res.status });
  }
  const leads = ((await res.json()) as LeadDTO[]).sort((a, b) => a.city.localeCompare(b.city) || b.createdAt.localeCompare(a.createdAt));
  const lines = [
    ["City", "Locality", "Phone", "Source", "Added (UTC)"].join(","),
    ...leads.map((l) => [l.city, l.locality, l.phone, l.source, l.createdAt].map(cell).join(",")),
  ];
  const date = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lasan-waitlist-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
