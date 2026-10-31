/**
 * Seeds launch data: geography, catalog, an admin, helpers in every live city, and realistic demo activity.
 * Usage: npm run db:seed            (skips if already seeded)
 *        npm run db:reset           (wipes all tables first)
 */
import bcrypt from "bcryptjs";
import { and, eq, sql } from "drizzle-orm";
import { CITIES, SERVICES, SLOTS, quote, serviceBySlug, type Frequency } from "@lasan/shared";
import { env } from "../env";
import { addDays, todayIST } from "../lib/http";
import { visitDates } from "../lib/bookings";
import { closeDb, db, runMigrations, schema } from "./client";

const reset = process.argv.includes("--reset");

await runMigrations();

if (reset) {
  await db.execute(
    sql`TRUNCATE visit_updates, visits, bookings, applications, providers, users, leads, localities, services, cities RESTART IDENTITY CASCADE`,
  );
  console.log("Wiped existing data.");
} else {
  const existing = await db.select().from(schema.cities).limit(1);
  if (existing.length) {
    console.log("Already seeded. Run `npm run db:reset` to wipe and reseed.");
    await closeDb();
    process.exit(0);
  }
}

// Deterministic randomness so every environment gets the same demo data.
let seed = 20261031;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];

// ---------- Geography & catalog ----------

await db.insert(schema.cities).values(CITIES.map(({ slug, name, state, status }) => ({ slug, name, state, status })));
await db.insert(schema.localities).values(CITIES.flatMap((c) => c.localities.map((name) => ({ citySlug: c.slug, name }))));
await db.insert(schema.services).values(SERVICES.map((s, i) => ({ ...s, sort: i })));

// ---------- Admin ----------

await db.insert(schema.users).values({
  role: "admin",
  name: "Lasan Ops",
  email: env.ADMIN_EMAIL.toLowerCase(),
  passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, 10),
});

// ---------- Service providers ----------

const PHOTOS = [
  "1622461828382-57a6f4590e0f",
  "1533128361669-69c065857a13",
  "1463335361701-e90f4c5045d0",
  "1596522868222-0df01d62b628",
  "1777726168469-6050899044ba",
  "1614642648978-f7324098b223",
  "1722176413255-537269cf2ba8",
];

type P = [name: string, city: string, locality: string, service: string, years: number, rating: number, reviews: number, languages: string[], bio: string];
const PROVIDERS: P[] = [
  // Tirupati
  ["Padma R.", "tirupati", "Balaji Colony", "daily-maid", 8, 4.9, 186, ["Telugu", "Hindi"], "Punctual to the minute and very thorough. Clients in Balaji Colony love her warmth."],
  ["Lakshmi K.", "tirupati", "Korlagunta", "daily-cook", 12, 4.9, 214, ["Telugu", "Tamil"], "Her pesarattu and tomato pappu are loved by every family she cooks for. Knows low-salt cooking well."],
  ["Saraswathi M.", "tirupati", "Tiruchanur", "live-in-maid", 6, 4.9, 97, ["Telugu", "Kannada"], "Calm and caring. Runs the whole house and sends the family a short note every evening."],
  ["Kalyani S.", "tirupati", "KT Road", "diet-cook", 9, 5.0, 132, ["Telugu", "English"], "Trained in diabetic cooking. Her ragi sangati and millet rotis turn diet charts into meals people enjoy."],
  ["Sujatha V.", "tirupati", "MR Palli", "deep-cleaning", 7, 4.8, 118, ["Telugu", "Tamil"], "Leads a two-person team and always uses gentle, odour-free products."],
  ["Annapurna D.", "tirupati", "Alipiri", "occasion-cook", 10, 4.9, 89, ["Telugu", "Hindi"], "Pulihora, chakkera pongali and a perfect banana-leaf meal. The cook families call for every festival."],
  ["Bhavani N.", "tirupati", "Bhavani Nagar", "laundry", 5, 4.7, 143, ["Telugu"], "Careful with silk and cotton sarees. Folds and stacks everything back exactly where it belongs."],
  // Hyderabad
  ["Fatima Begum", "hyderabad", "Mehdipatnam", "daily-cook", 14, 4.9, 241, ["Urdu", "Hindi", "Telugu"], "Hyderabadi home food done light: khatti dal, bagara rice and soft phulkas, with less oil when asked."],
  ["Sravani P.", "hyderabad", "Kukatpally", "daily-maid", 6, 4.8, 167, ["Telugu", "Hindi"], "Quick, tidy and never misses a corner. Busy working women in KPHB rely on her mornings."],
  ["Manjula R.", "hyderabad", "Gachibowli", "diet-cook", 8, 4.9, 122, ["Telugu", "English", "Hindi"], "High-protein tiffins and millet bowls for women on a fitness or PCOS diet. Plans the week with you."],
  ["Renuka G.", "hyderabad", "Madhapur", "laundry", 4, 4.7, 88, ["Telugu", "Hindi"], "Office wear crisply ironed and sarees hand-washed. Picks up and drops back the same day."],
  ["Shabana K.", "hyderabad", "Tarnaka", "deep-cleaning", 9, 4.8, 104, ["Urdu", "Hindi", "Telugu"], "Runs a two-woman deep-clean team. Kitchens, balconies and bathrooms left sparkling."],
  ["Yadamma B.", "hyderabad", "Secunderabad", "live-in-maid", 11, 4.9, 76, ["Telugu"], "Has lived with and cared for three families over a decade. Steady, respectful and calm."],
  ["Jyothi S.", "hyderabad", "Banjara Hills", "occasion-cook", 12, 4.9, 93, ["Telugu", "Hindi", "English"], "Bathukamma and Bonalu feasts, birthday lunches and pooja prasadam for up to 15 guests."],
  // Warangal
  ["Rajitha M.", "warangal", "Hanamkonda", "daily-maid", 5, 4.8, 64, ["Telugu"], "Neat, quiet and dependable. Knows every lane of Hanamkonda."],
  ["Swapna T.", "warangal", "Kazipet", "daily-cook", 7, 4.8, 58, ["Telugu", "Hindi"], "Telangana-style pachi pulusu, sarva pindi and jonna rotte, cooked fresh at home."],
  // Vijayawada
  ["Durga Bhavani", "vijayawada", "Benz Circle", "daily-cook", 10, 4.9, 151, ["Telugu"], "Gongura pappu, ulavacharu and perfect curd rice. Adjusts spice for every member of the family."],
  ["Naga Lakshmi", "vijayawada", "Patamata", "daily-maid", 6, 4.8, 109, ["Telugu"], "Starts at 7 sharp. Homes in Patamata and Gunadala swear by her."],
  ["Kanaka Durga", "vijayawada", "Governorpet", "occasion-cook", 15, 5.0, 71, ["Telugu"], "The festive cook for Dasara at Indrakeeladri season: pulihora, garelu and bobbatlu."],
  // Visakhapatnam
  ["Gowri S.", "visakhapatnam", "MVP Colony", "daily-maid", 7, 4.8, 120, ["Telugu", "Odia"], "Thorough and gentle, especially in homes with elders. Covers MVP Colony and Siripuram."],
  ["Satyavathi K.", "visakhapatnam", "Seethammadhara", "daily-cook", 11, 4.9, 133, ["Telugu", "Odia", "Hindi"], "Uttarandhra flavours and fresh fish curry on request, with a light hand on oil."],
  ["Ramanamma P.", "visakhapatnam", "Madhurawada", "deep-cleaning", 8, 4.7, 66, ["Telugu"], "Salt-air proof cleaning: grills, windows and balconies done properly."],
  // Guntur
  ["Prasanna V.", "guntur", "Brodipet", "daily-cook", 9, 4.8, 97, ["Telugu"], "Guntur heat when you want it, mild when you don't. Famous for her avakaya and pappu podi."],
  ["Vani R.", "guntur", "Lakshmipuram", "daily-maid", 4, 4.7, 52, ["Telugu"], "Cheerful and quick. Families in Lakshmipuram and Arundelpet book her for years."],
];

const providerRows = await db
  .insert(schema.providers)
  .values(
    PROVIDERS.map(([name, citySlug, locality, serviceSlug, years, rating, reviews, languages, bio], i) => {
      const svc = serviceBySlug(serviceSlug)!;
      return {
        name,
        phone: `+9190000001${String(i + 1).padStart(2, "0")}`,
        title: svc.name,
        category: svc.category,
        serviceSlug,
        citySlug,
        locality,
        years,
        rating,
        reviews,
        languages,
        photo: PHOTOS[i % PHOTOS.length],
        rate: Math.round((svc.price * (1 + years / 100)) / 10) * 10 - 1,
        unit: svc.unit,
        bio,
        status: "active" as const,
        aadhaarVerified: true,
        policeVerified: true,
        createdAt: new Date(Date.now() - (60 + i * 9) * 86400_000),
      };
    }),
  )
  .returning();

// One awaiting verification and one on hold, so the admin console has real states to work with.
await db.insert(schema.providers).values([
  { name: "Mounika L.", phone: "+919000000198", title: "Daily maid", category: "maid", serviceSlug: "daily-maid", citySlug: "hyderabad", locality: "Miyapur", years: 2, languages: ["Telugu"], photo: PHOTOS[3], rate: 199, unit: "visit", status: "pending", aadhaarVerified: true },
  { name: "Roja K.", phone: "+919000000199", title: "Daily home cook", category: "cook", serviceSlug: "daily-cook", citySlug: "guntur", locality: "Kothapet", years: 3, rating: 4.1, reviews: 12, languages: ["Telugu"], photo: PHOTOS[5], rate: 299, unit: "day", status: "suspended", aadhaarVerified: true, policeVerified: true },
]);

const byName = (n: string) => providerRows.find((p) => p.name === n)!;

// ---------- Customers & bookings ----------

type C = [name: string, phone: string, city: string, locality: string];
const CUSTOMERS: C[] = [
  ["Srinivas Reddy", "+919000000001", "tirupati", "Korlagunta"],
  ["Priya Sharma", "+919000000002", "hyderabad", "Gachibowli"],
  ["Ayesha Siddiqui", "+919000000003", "hyderabad", "Mehdipatnam"],
  ["Lavanya Naidu", "+919000000004", "tirupati", "Tiruchanur"],
  ["Deepika Varma", "+919000000005", "visakhapatnam", "MVP Colony"],
  ["Sunitha Rao", "+919000000006", "vijayawada", "Patamata"],
  ["Harika Goud", "+919000000007", "warangal", "Hanamkonda"],
  ["Madhavi Chowdary", "+919000000008", "guntur", "Brodipet"],
  ["Anusha Reddy", "+919000000009", "hyderabad", "Kukatpally"],
  ["Venkat Rao", "+919000000010", "visakhapatnam", "Seethammadhara"],
  ["Kavitha Chowdary", "+919000000011", "vijayawada", "Benz Circle"],
  ["Ramesh Babu", "+919000000012", "tirupati", "Balaji Colony"],
];
const customerRows = await db
  .insert(schema.users)
  .values(CUSTOMERS.map(([name, phone, citySlug, locality], i) => ({ role: "customer" as const, name, phone, citySlug, locality, address: `${10 + i}-${i + 2}-${30 + i * 3}, Main Road`, createdAt: new Date(Date.now() - (50 - i * 3) * 86400_000) })))
  .returning();

const today = todayIST();
const RECIPIENTS = ["Saroja Devi", "Kamala", "Vijaya Lakshmi", "Sarada", "Rukmini", "Padmavathi", "Myself"];
let codeN = 1000;

async function addBooking(o: {
  customer: (typeof customerRows)[number];
  serviceSlug?: string;
  planSlug?: "tidy" | "complete" | "nourish";
  frequency: Frequency;
  startDate: string;
  status: "requested" | "confirmed" | "active" | "completed" | "cancelled";
  provider?: (typeof providerRows)[number];
  recipientName?: string;
  forWhom?: string;
  createdDaysAgo: number;
  food?: string | null;
  diets?: string[];
}) {
  const svc = o.serviceSlug ? serviceBySlug(o.serviceSlug)! : undefined;
  const total = quote({ services: svc ? [svc] : [], frequency: o.frequency, plan: o.planSlug ? { slug: o.planSlug, price: { tidy: 4999, complete: 11999, nourish: 7999 }[o.planSlug] } : null });
  const [b] = await db
    .insert(schema.bookings)
    .values({
      code: `LF-${o.startDate.slice(2, 4)}${o.startDate.slice(5, 7)}-${codeN++}`,
      customerId: o.customer.id,
      status: o.status,
      need: o.planSlug ? ({ tidy: "maid", complete: "both", nourish: "cook" } as const)[o.planSlug] : svc!.category,
      serviceSlugs: svc ? [svc.slug] : [],
      planSlug: o.planSlug ?? null,
      frequency: o.planSlug ? "month" : o.frequency,
      startDate: o.startDate,
      slot: svc?.category === "cook" ? SLOTS[1] : SLOTS[0],
      recipientName: o.recipientName ?? (o.customer.name.split(" ")[0] ?? "Customer"),
      forWhom: o.forWhom ?? "Myself",
      phone: o.customer.phone!,
      citySlug: o.customer.citySlug!,
      locality: o.customer.locality!,
      address: o.customer.address!,
      food: svc?.category === "cook" || o.planSlug ? (o.food ?? "Vegetarian") : null,
      diets: o.diets ?? [],
      total,
      providerId: o.provider?.id ?? null,
      createdAt: new Date(Date.now() - o.createdDaysAgo * 86400_000 - rand() * 36e6),
    })
    .returning();
  if (o.provider && o.status !== "requested" && o.status !== "cancelled") {
    const dates = visitDates(b);
    const amount = Math.round(b.total / dates.length);
    await db.insert(schema.visits).values(
      dates.map((date) => ({
        bookingId: b.id,
        providerId: o.provider!.id,
        date,
        slot: b.slot,
        amount,
        status: date < today ? ("done" as const) : ("scheduled" as const),
        checkInAt: date < today ? new Date(`${date}T08:0${Math.floor(rand() * 9)}:00+05:30`) : null,
        checkOutAt: date < today ? new Date(`${date}T11:${10 + Math.floor(rand() * 40)}:00+05:30`) : null,
      })),
    );
  }
  return b;
}

// Demo family (customer app login +91 90000 00001): Srinivas books daily help and cooking for his mother in Tirupati.
const srinivas = customerRows[0];
const maidBooking = await addBooking({ customer: srinivas, serviceSlug: "daily-maid", frequency: "month", startDate: addDays(today, -12), status: "active", provider: byName("Padma R."), recipientName: "Saroja Devi", forWhom: "My mother", createdDaysAgo: 14 });
const cookBooking = await addBooking({ customer: srinivas, serviceSlug: "diet-cook", frequency: "month", startDate: addDays(today, -12), status: "active", provider: byName("Lakshmi K."), recipientName: "Saroja Devi", forWhom: "My mother", createdDaysAgo: 14, diets: ["Diabetic-friendly", "Low salt"] });
await addBooking({ customer: srinivas, serviceSlug: "deep-cleaning", frequency: "once", startDate: addDays(today, 6), status: "requested", recipientName: "Saroja Devi", forWhom: "My mother", createdDaysAgo: 0 });

// Today's live progress for the demo family.
const [maidToday] = await db.select().from(schema.visits).where(and(eq(schema.visits.bookingId, maidBooking.id), eq(schema.visits.date, today)));
const [cookToday] = await db.select().from(schema.visits).where(and(eq(schema.visits.bookingId, cookBooking.id), eq(schema.visits.date, today)));
if (maidToday) {
  await db.update(schema.visits).set({ status: "in_progress", checkInAt: new Date(`${today}T08:00:00+05:30`) }).where(eq(schema.visits.id, maidToday.id));
  await db.insert(schema.visitUpdates).values([
    { visitId: maidToday.id, kind: "check_in", title: "Checked in at home", createdAt: new Date(`${today}T08:00:00+05:30`) },
    { visitId: maidToday.id, kind: "task", title: "House swept & mopped", detail: "Bedroom, hall & balcony", createdAt: new Date(`${today}T08:40:00+05:30`) },
    { visitId: maidToday.id, kind: "task", title: "Laundry washed & 2 sarees ironed", createdAt: new Date(`${today}T10:30:00+05:30`) },
  ]);
}
if (cookToday) {
  await db.update(schema.visits).set({ status: "in_progress", checkInAt: new Date(`${today}T11:05:00+05:30`) }).where(eq(schema.visits.id, cookToday.id));
  await db.insert(schema.visitUpdates).values([
    { visitId: cookToday.id, kind: "check_in", title: "Checked in at home", createdAt: new Date(`${today}T11:05:00+05:30`) },
    {
      visitId: cookToday.id,
      kind: "meal",
      title: "Lunch: tomato pappu, beans fry & rasam",
      detail: "Amma loved the beans fry and asked for it again on Friday. Less salt, as always.",
      photoUrl: "https://images.unsplash.com/photo-1742281257687-092746ad6021?auto=format&fit=crop&w=900&q=80",
      createdAt: new Date(`${today}T12:30:00+05:30`),
    },
  ]);
}

// Spread of activity across all live cities for the last ~40 days.
const statuses = ["completed", "completed", "active", "active", "confirmed", "requested", "cancelled"] as const;
for (let i = 0; i < 70; i++) {
  const customer = customerRows[1 + (i % (customerRows.length - 1))];
  const local = providerRows.filter((p) => p.citySlug === customer.citySlug);
  const provider = pick(local);
  const daysAgo = Math.floor(rand() * 40);
  const status = daysAgo > 30 ? "completed" : pick(statuses);
  const freq: Frequency = provider.unit === "visit" || provider.unit === "day" ? pick(["once", "week", "month"] as const) : "once";
  const isPlan = rand() < 0.12;
  await addBooking({
    customer,
    serviceSlug: isPlan ? undefined : provider.serviceSlug,
    planSlug: isPlan ? pick(["tidy", "complete", "nourish"] as const) : undefined,
    frequency: freq,
    startDate: addDays(today, -daysAgo + 1),
    status,
    provider: status === "requested" ? undefined : provider,
    recipientName: pick(RECIPIENTS),
    forWhom: pick(["Myself", "My mother", "Mother-in-law", "Grandmother"]),
    createdDaysAgo: daysAgo,
  });
}

// ---------- Helper applications ----------

await db.insert(schema.applications).values([
  { name: "Sirisha M.", phone: "+919100000001", citySlug: "hyderabad", locality: "Uppal", experience: "3-7", skills: ["daily-maid", "laundry"], languages: ["Telugu", "Hindi"], stage: "new" },
  { name: "Nasreen B.", phone: "+919100000002", citySlug: "hyderabad", locality: "Mehdipatnam", experience: "7+", skills: ["daily-cook", "occasion-cook"], languages: ["Urdu", "Hindi"], stage: "new" },
  { name: "Lalitha K.", phone: "+919100000003", citySlug: "vijayawada", locality: "Bhavanipuram", experience: "1-3", skills: ["daily-maid"], languages: ["Telugu"], stage: "screening" },
  { name: "Aruna P.", phone: "+919100000004", citySlug: "visakhapatnam", locality: "Gajuwaka", experience: "3-7", skills: ["daily-cook", "diet-cook"], languages: ["Telugu", "Odia"], stage: "screening" },
  { name: "Sandhya R.", phone: "+919100000005", citySlug: "tirupati", locality: "Akkarampalli", experience: "1-3", skills: ["laundry", "daily-maid"], languages: ["Telugu", "Tamil"], stage: "documents" },
  { name: "Pushpa L.", phone: "+919100000006", citySlug: "warangal", locality: "Subedari", experience: "7+", skills: ["daily-cook"], languages: ["Telugu"], stage: "documents" },
  { name: "Hema S.", phone: "+919100000007", citySlug: "guntur", locality: "Vidya Nagar", experience: "3-7", skills: ["deep-cleaning"], languages: ["Telugu"], stage: "skills_test" },
  { name: "Rekha G.", phone: "+919100000008", citySlug: "hyderabad", locality: "Kondapur", experience: "3-7", skills: ["diet-cook"], languages: ["Telugu", "English"], stage: "skills_test" },
  { name: "Bharathi N.", phone: "+919100000009", citySlug: "tirupati", locality: "Gandhi Road", experience: "0", skills: ["daily-maid"], languages: ["Telugu"], stage: "rejected", notes: "Reference calls did not check out." },
  { name: "Vasantha D.", phone: "+919100000010", citySlug: "nellore", locality: "Magunta Layout", experience: "7+", skills: ["daily-cook"], languages: ["Telugu"], stage: "new", notes: "Nellore is on the waitlist: keep warm for launch." },
]);

// ---------- Waitlist leads ----------

await db.insert(schema.leads).values([
  { phone: "+919200000001", city: "Nellore", locality: "Magunta Layout" },
  { phone: "+919200000002", city: "Nellore", locality: "Vedayapalem" },
  { phone: "+919200000003", city: "Kurnool", locality: "Budhawarpet" },
  { phone: "+919200000004", city: "Rajahmundry", locality: "Danavaipeta" },
  { phone: "+919200000005", city: "Kakinada", locality: "Ramanayyapeta" },
  { phone: "+919200000006", city: "Karimnagar", locality: "Mankammathota" },
  { phone: "+919200000007", city: "Khammam", locality: "Wyra Road" },
  { phone: "+919200000008", city: "Nizamabad", locality: "Pragathi Nagar" },
  { phone: "+919200000009", city: "Nellore", locality: "Balaji Nagar", source: "app" },
  { phone: "+919200000010", city: "Hyderabad", locality: "Shamshabad" },
]);

const [{ n: bookingCount }] = (await db.execute(sql`SELECT count(*)::int AS n FROM bookings`)).rows as { n: number }[];
console.log(`Seeded ${CITIES.length} cities, ${SERVICES.length} services, ${providerRows.length + 2} providers, ${customerRows.length} customers, ${bookingCount} bookings.`);
console.log(`Admin login: ${env.ADMIN_EMAIL} (password from ADMIN_PASSWORD)`);
console.log("Dev OTP logins (code 123456): customer +91 90000 00001 · provider +91 90000 00101 (Padma R.)");
await closeDb();
