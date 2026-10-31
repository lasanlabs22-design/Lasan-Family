import { z } from "zod";
import { DIETS, FOOD, FOR_WHOM, type Category, type Need, type Unit } from "./catalog";
import type { CityStatus, StateCode } from "./geo";
import { FREQUENCIES, SLOTS, type Frequency } from "./pricing";
import { normalizePhone } from "./brand";

// ---------- Enums ----------

export const ROLES = ["customer", "provider", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const BOOKING_STATUSES = ["requested", "confirmed", "active", "completed", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PROVIDER_STATUSES = ["pending", "active", "suspended"] as const;
export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];

export const APPLICATION_STAGES = ["new", "screening", "documents", "skills_test", "approved", "rejected"] as const;
export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export const VISIT_STATUSES = ["scheduled", "in_progress", "done", "missed", "cancelled"] as const;
export type VisitStatus = (typeof VISIT_STATUSES)[number];

export const STAGE_LABEL: Record<ApplicationStage, string> = {
  new: "New",
  screening: "Phone screening",
  documents: "Aadhaar & police check",
  skills_test: "Skills session",
  approved: "Approved",
  rejected: "Rejected",
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ---------- Field helpers ----------

const phone = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const p = normalizePhone(v);
    if (!p) ctx.addIssue({ code: "custom", message: "Enter a valid 10-digit Indian mobile number" });
    return p ?? v;
  });

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const frequencyIds = FREQUENCIES.map((f) => f.id) as [Frequency, ...Frequency[]];

// ---------- Request schemas ----------

export const createBookingSchema = z
  .object({
    need: z.enum(["maid", "cook", "both"]),
    serviceSlugs: z.array(z.string()).default([]),
    planSlug: z.enum(["tidy", "complete", "nourish"]).nullish(),
    frequency: z.enum(frequencyIds).default("once"),
    startDate: isoDate,
    slot: z.enum(SLOTS),
    citySlug: z.string().min(1),
    locality: z.string().min(1, "Choose a locality"),
    address: z.string().trim().min(3, "Enter the house number and street"),
    forWhom: z.enum(FOR_WHOM).default("Myself"),
    recipientName: z.string().trim().min(2, "Enter her name"),
    phone,
    food: z.enum(FOOD).nullish(),
    diets: z.array(z.enum(DIETS)).default([]),
    notes: z.string().trim().max(1000).default(""),
    providerId: z.string().uuid().nullish(),
  })
  .refine((b) => b.planSlug || b.serviceSlugs.length > 0, { message: "Pick at least one service or a plan", path: ["serviceSlugs"] });
export type CreateBookingInput = z.input<typeof createBookingSchema>;

export const leadSchema = z.object({
  phone,
  city: z.string().trim().min(2),
  locality: z.string().trim().default(""),
  source: z.enum(["website", "app", "admin"]).default("website"),
});
export type LeadInput = z.input<typeof leadSchema>;

export const applicationSchema = z.object({
  name: z.string().trim().min(2),
  phone,
  citySlug: z.string().min(1),
  locality: z.string().trim().default(""),
  experience: z.enum(["0", "1-3", "3-7", "7+"]).default("1-3"),
  skills: z.array(z.string()).min(1, "Pick at least one skill"),
  languages: z.array(z.string()).default(["Telugu"]),
});
export type ApplicationInput = z.input<typeof applicationSchema>;

export const firebaseLoginSchema = z.object({ idToken: z.string().min(10), role: z.enum(["customer", "provider"]) });
export const devLoginSchema = z.object({ phone, role: z.enum(["customer", "provider"]), code: z.string().length(6) });
export const adminLoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  citySlug: z.string().optional(),
  locality: z.string().optional(),
  address: z.string().optional(),
  food: z.enum(FOOD).nullish(),
  diets: z.array(z.enum(DIETS)).optional(),
});

export const visitUpdateSchema = z.object({
  kind: z.enum(["task", "meal", "note"]),
  title: z.string().trim().min(2).max(140),
  detail: z.string().trim().max(500).default(""),
  photoUrl: z.string().url().nullish(),
});

export const adminBookingPatchSchema = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  providerId: z.string().uuid().nullable().optional(),
});
export const adminProviderPatchSchema = z.object({
  status: z.enum(PROVIDER_STATUSES).optional(),
  rate: z.number().int().positive().optional(),
  aadhaarVerified: z.boolean().optional(),
  policeVerified: z.boolean().optional(),
});
export const adminApplicationPatchSchema = z.object({ stage: z.enum(APPLICATION_STAGES), notes: z.string().optional() });
export const adminCityPatchSchema = z.object({
  status: z.enum(["live", "waitlist", "paused"]).optional(),
  addLocality: z.string().trim().min(2).optional(),
});
export const adminServicePatchSchema = z.object({ price: z.number().int().positive().optional(), active: z.boolean().optional() });

// ---------- Response DTOs ----------

export type CityDTO = { slug: string; name: string; state: StateCode; stateName: string; status: CityStatus; localities: string[] };

export type ServiceDTO = {
  slug: string;
  name: string;
  short: string;
  description: string;
  category: Category;
  icon: string;
  price: number;
  unit: Unit;
  image: string;
  includes: string[];
  active: boolean;
};

export type ProviderDTO = {
  id: string;
  name: string;
  title: string;
  category: Category;
  serviceSlug: string;
  citySlug: string;
  cityName: string;
  locality: string;
  years: number;
  rating: number;
  reviews: number;
  languages: string[];
  photo: string;
  rate: number;
  unit: Unit;
  bio: string;
};

export type AdminProviderDTO = ProviderDTO & {
  phone: string;
  status: ProviderStatus;
  aadhaarVerified: boolean;
  policeVerified: boolean;
  activeBookings: number;
  joinedAt: string;
};

export type VisitUpdateDTO = { id: string; kind: "task" | "meal" | "note" | "check_in" | "check_out"; title: string; detail: string; photoUrl: string | null; at: string };

export type VisitDTO = {
  id: string;
  bookingId: string;
  bookingCode: string;
  date: string;
  slot: string;
  status: VisitStatus;
  checkInAt: string | null;
  checkOutAt: string | null;
  provider: Pick<ProviderDTO, "id" | "name" | "title" | "photo" | "category"> | null;
  updates: VisitUpdateDTO[];
};

export type BookingDTO = {
  id: string;
  code: string;
  status: BookingStatus;
  need: Need;
  services: { slug: string; name: string }[];
  planSlug: string | null;
  frequency: Frequency;
  startDate: string;
  slot: string;
  recipientName: string;
  forWhom: string;
  phone: string;
  citySlug: string;
  cityName: string;
  locality: string;
  address: string;
  food: string | null;
  diets: string[];
  notes: string;
  total: number;
  provider: Pick<ProviderDTO, "id" | "name" | "title" | "photo"> | null;
  /** The helper the customer picked when booking (the admin console prefers her when assigning). */
  requestedProviderId: string | null;
  createdAt: string;
};

export type ApplicationDTO = {
  id: string;
  name: string;
  phone: string;
  citySlug: string;
  cityName: string;
  locality: string;
  experience: string;
  skills: string[];
  languages: string[];
  stage: ApplicationStage;
  notes: string;
  createdAt: string;
};

export type LeadDTO = { id: string; phone: string; city: string; locality: string; source: string; createdAt: string };

export type CustomerDTO = { id: string; name: string; phone: string; cityName: string | null; bookings: number; lifetimeValue: number; createdAt: string };

export type SessionUser = { id: string; role: Role; name: string; phone: string | null; email: string | null; providerId: string | null };
export type AuthResponse = { token: string; user: SessionUser };

export type AdminOverviewDTO = {
  kpis: { bookings30d: number; revenue30d: number; activeProviders: number; pendingApplications: number; liveCities: number; waitlistLeads: number };
  byCity: { citySlug: string; cityName: string; state: StateCode; bookings: number; revenue: number; providers: number }[];
  daily: { date: string; bookings: number; revenue: number }[];
  recentBookings: BookingDTO[];
};

export type ProviderEarningsDTO = { thisWeek: number; thisMonth: number; visitsThisMonth: number; payouts: { date: string; amount: number; status: "paid" | "scheduled" }[] };

export type ApiError = { error: string; issues?: { path: string; message: string }[] };
