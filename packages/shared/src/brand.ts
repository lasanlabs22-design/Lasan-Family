export const BRAND = {
  name: "Lasan Family",
  short: "Lasan",
  tagline: "Trusted maids & home cooks for women at home",
  // Placeholders until the real support lines are set up.
  supportPhone: "+91 80000 00000",
  supportPhoneHref: "tel:+918000000000",
  supportEmail: "care@lasanfamily.in",
  website: "https://lasanfamily.in",
} as const;

export const unsplash = (id: string, w = 1200, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=80`;

export const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Normalises Indian mobile numbers to E.164 (+91XXXXXXXXXX). Returns null if it isn't a valid 10-digit mobile. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}
