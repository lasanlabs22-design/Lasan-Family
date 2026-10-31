import { boolean, date, index, integer, jsonb, pgEnum, pgTable, real, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["customer", "provider", "admin"]);
export const categoryEnum = pgEnum("category", ["maid", "cook"]);
export const needEnum = pgEnum("need", ["maid", "cook", "both"]);
export const cityStatusEnum = pgEnum("city_status", ["live", "waitlist", "paused"]);
export const bookingStatusEnum = pgEnum("booking_status", ["requested", "confirmed", "active", "completed", "cancelled"]);
export const providerStatusEnum = pgEnum("provider_status", ["pending", "active", "suspended"]);
export const applicationStageEnum = pgEnum("application_stage", ["new", "screening", "documents", "skills_test", "approved", "rejected"]);
export const visitStatusEnum = pgEnum("visit_status", ["scheduled", "in_progress", "done", "missed", "cancelled"]);
export const updateKindEnum = pgEnum("visit_update_kind", ["task", "meal", "note", "check_in", "check_out"]);

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

// ---------- Geography ----------

export const cities = pgTable("cities", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(), // "AP" | "TG"
  status: cityStatusEnum("status").notNull().default("waitlist"),
  createdAt: createdAt(),
});

export const localities = pgTable(
  "localities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    citySlug: text("city_slug")
      .notNull()
      .references(() => cities.slug, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("localities_city_name").on(t.citySlug, t.name)],
);

// ---------- Catalog ----------

export const services = pgTable("services", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  short: text("short").notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull(),
  icon: text("icon").notNull(),
  price: integer("price").notNull(),
  unit: text("unit").notNull(),
  image: text("image").notNull(),
  includes: jsonb("includes").$type<string[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

// ---------- People ----------

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    role: roleEnum("role").notNull(),
    name: text("name").notNull().default(""),
    phone: text("phone"),
    email: text("email"),
    passwordHash: text("password_hash"),
    firebaseUid: text("firebase_uid"),
    // Customer profile defaults (the person receiving care)
    citySlug: text("city_slug").references(() => cities.slug),
    locality: text("locality"),
    address: text("address"),
    food: text("food"),
    diets: jsonb("diets").$type<string[]>().notNull().default([]),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  // A phone can be both a customer and a provider account, so uniqueness is per role.
  (t) => [uniqueIndex("users_role_phone").on(t.role, t.phone), uniqueIndex("users_email").on(t.email)],
);

export const providers = pgTable(
  "providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    title: text("title").notNull(),
    category: categoryEnum("category").notNull(),
    serviceSlug: text("service_slug")
      .notNull()
      .references(() => services.slug),
    citySlug: text("city_slug")
      .notNull()
      .references(() => cities.slug),
    locality: text("locality").notNull().default(""),
    years: integer("years").notNull().default(0),
    rating: real("rating").notNull().default(0),
    reviews: integer("reviews").notNull().default(0),
    languages: jsonb("languages").$type<string[]>().notNull().default([]),
    photo: text("photo").notNull().default(""),
    rate: integer("rate").notNull(),
    unit: text("unit").notNull(),
    bio: text("bio").notNull().default(""),
    status: providerStatusEnum("status").notNull().default("pending"),
    aadhaarVerified: boolean("aadhaar_verified").notNull().default(false),
    policeVerified: boolean("police_verified").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("providers_city").on(t.citySlug), uniqueIndex("providers_phone").on(t.phone)],
);

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  citySlug: text("city_slug")
    .notNull()
    .references(() => cities.slug),
  locality: text("locality").notNull().default(""),
  experience: text("experience").notNull(),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  stage: applicationStageEnum("stage").notNull().default("new"),
  notes: text("notes").notNull().default(""),
  providerId: uuid("provider_id").references(() => providers.id),
  createdAt: createdAt(),
});

// ---------- Bookings & visits ----------

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    customerId: uuid("customer_id").references(() => users.id),
    status: bookingStatusEnum("status").notNull().default("requested"),
    need: needEnum("need").notNull(),
    serviceSlugs: jsonb("service_slugs").$type<string[]>().notNull().default([]),
    planSlug: text("plan_slug"),
    frequency: text("frequency").notNull().default("once"),
    startDate: date("start_date").notNull(),
    slot: text("slot").notNull(),
    recipientName: text("recipient_name").notNull(),
    forWhom: text("for_whom").notNull(),
    phone: text("phone").notNull(),
    citySlug: text("city_slug")
      .notNull()
      .references(() => cities.slug),
    locality: text("locality").notNull(),
    address: text("address").notNull(),
    food: text("food"),
    diets: jsonb("diets").$type<string[]>().notNull().default([]),
    notes: text("notes").notNull().default(""),
    total: integer("total").notNull(),
    providerId: uuid("provider_id").references(() => providers.id),
    requestedProviderId: uuid("requested_provider_id").references(() => providers.id),
    createdAt: createdAt(),
  },
  (t) => [index("bookings_customer").on(t.customerId), index("bookings_city").on(t.citySlug), index("bookings_created").on(t.createdAt)],
);

export const visits = pgTable(
  "visits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id").references(() => providers.id),
    date: date("date").notNull(),
    slot: text("slot").notNull(),
    status: visitStatusEnum("status").notNull().default("scheduled"),
    checkInAt: timestamp("check_in_at", { withTimezone: true }),
    checkOutAt: timestamp("check_out_at", { withTimezone: true }),
    amount: integer("amount").notNull().default(0),
  },
  (t) => [index("visits_provider_date").on(t.providerId, t.date), index("visits_booking").on(t.bookingId)],
);

export const visitUpdates = pgTable(
  "visit_updates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitId: uuid("visit_id")
      .notNull()
      .references(() => visits.id, { onDelete: "cascade" }),
    kind: updateKindEnum("kind").notNull(),
    title: text("title").notNull(),
    detail: text("detail").notNull().default(""),
    photoUrl: text("photo_url"),
    createdAt: createdAt(),
  },
  (t) => [index("visit_updates_visit").on(t.visitId)],
);

// ---------- Growth ----------

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  locality: text("locality").notNull().default(""),
  source: text("source").notNull().default("website"),
  createdAt: createdAt(),
});
