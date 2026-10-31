# Lasan Family: technical handoff

Lasan Family is a marketplace for verified **women maids and home cooks** for **women at home** (working women, new mothers, women living alone, and mothers whose children book for them) across **Andhra Pradesh and Telangana**.

## 1. Monorepo layout (npm workspaces, Node 22)

| Path | Package | Purpose | Status |
| --- | --- | --- | --- |
| `packages/shared` | `@lasan/shared` | Brand, geography, catalog, pricing, Zod schemas, DTO types, typed fetch client | ✅ done |
| `apps/api` | `@lasan/api` | Hono + Drizzle ORM + PostgreSQL REST API | ✅ done, live |
| `apps/web` | `@lasan/web` | Public website (Next.js 16, Tailwind v4) | ✅ done, live |
| `apps/admin` | `@lasan/admin` | Admin console for the ops team (Next.js 16, Tailwind v4) | ✅ done, live |
| `apps/mobile` | `@lasan/mobile` | One Expo app with **two logins: Customer and Service provider** | ✅ done (Expo Go; store builds pending) |

Install everything from the repo root with `npm install`. Import shared code with `import { ... } from "@lasan/shared"`. Workspace packages are transpiled automatically by Next.js and Metro.

**Next.js 16 is newer than most training data.** Read `node_modules/next/dist/docs/` before using unfamiliar APIs. Cache Components is enabled (`cacheComponents: true`): server reads use `"use cache"` + `cacheLife(...)`; dynamic reads go inside `<Suspense>`. Don't call `new Date()` in server components outside a cache scope. `apps/web/src/lib/api.ts` is the reference pattern.

## 2. Running locally

```bash
npm install
npm run dev:api        # http://localhost:4000. Without DATABASE_URL it uses embedded PGlite in apps/api/.pglite
npm run db:seed -w @lasan/api   # first run only (migrations run automatically on boot)
npm run dev:web        # http://localhost:3000
```

Copy `apps/api/.env.example` to `apps/api/.env` first. For local work, leave `DATABASE_URL` empty (PGlite), keep `AUTH_DEV_MODE=true`, and set any `ADMIN_PASSWORD`. The seed creates the admin `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Dev / demo logins (OTP `123456`):
- Customer: `+91 90000 00001` (Srinivas: two active bookings for his mother in Tirupati, with live visits today)
- Service provider: `+91 90000 00101` (Padma R., daily maid in Tirupati, with today's visit in progress)

## 3. Production (Railway project `lasan-family`)

Every service deploys **automatically from `main`** on GitHub. Each builds a Dockerfile from the repo root, selected with `RAILWAY_DOCKERFILE_PATH`.

| Service | URL | Dockerfile | Port |
| --- | --- | --- | --- |
| api | https://api-production-05746.up.railway.app | `apps/api/Dockerfile` | 4000 |
| web | https://web-production-d4f12.up.railway.app | `apps/web/Dockerfile` | 3000 |
| admin | https://admin-production-c858f.up.railway.app | `apps/admin/Dockerfile` | 3001 |
| Postgres | private network | n/a | n/a |

The admin and web services receive `NEXT_PUBLIC_API_URL=https://api-production-05746.up.railway.app` as a Docker build arg (declare `ARG NEXT_PUBLIC_API_URL`). `next start` reads `PORT` from the environment. In production the API allows OTP `123456` only for the `DEMO_PHONES` accounts above; everything else needs Firebase phone auth (configured by the owner on Monday; leave it pluggable).

## 4. API reference (`/v1`, JSON, Bearer JWT)

Types live in `packages/shared/src/api.ts`; use `createApiClient` from `@lasan/shared`.

- **Public**: `GET /cities` · `GET /services` · `GET /plans` · `GET /providers?city=&category=&q=` · `GET /providers/:id` · `POST /bookings` · `POST /leads` · `POST /applications`
- **Auth**: `GET /auth/config` → `{ firebase, devMode, demo }` · `POST /auth/firebase {idToken, role}` · `POST /auth/dev {phone, role, code}` · `POST /auth/admin {email, password}` · `GET /auth/me`. All return `{ token, user }`; `role` is `customer` or `provider`. A provider login fails with 403 unless the phone belongs to an onboarded provider.
- **Customer** (`role=customer`): `GET /me/home` → `{ today: VisitDTO[], upcoming: VisitDTO[] }` · `GET /me/bookings` · `GET /me/bookings/:id` → `{ booking, visits }` · `POST /me/bookings/:id/cancel` · `PATCH /me/profile`. Customers create bookings with `POST /bookings` while signed in.
- **Provider** (`role=provider`): `GET /provider/me` · `GET /provider/visits?range=today|upcoming|past` (each visit has a `job` with recipient, phone, address, services, food, diets, notes) · `POST /provider/visits/:id/check-in` · `POST /provider/visits/:id/check-out` · `POST /provider/visits/:id/updates {kind: task|meal|note, title, detail, photoUrl?}` · `GET /provider/earnings`
- **Admin** (`role=admin`): `GET /admin/overview` (KPIs, byCity, 30-day daily series, recent bookings) · `GET /admin/bookings?status=&city=&q=` · `PATCH /admin/bookings/:id {status?, providerId?}` (assigning a helper confirms the booking and generates visits; the helper must be active and in the same city) · `GET /admin/providers?status=&city=&q=` · `PATCH /admin/providers/:id {status?, rate?, aadhaarVerified?, policeVerified?}` (activation requires both verifications) · `GET /admin/applications?stage=` · `PATCH /admin/applications/:id {stage, notes?}` (`approved` auto-creates an active provider) · `GET /admin/customers?q=` · `GET /admin/cities` · `PATCH /admin/cities/:slug {status?, addLocality?}` · `GET /admin/services` · `PATCH /admin/services/:slug {price?, active?}` · `GET /admin/leads`

Errors are `{ error, issues? }` with a friendly message; show `error` to users.

## 5. Design system (shared by web, admin, mobile)

- Fonts: **Fraunces** (display, serif) and **Plus Jakarta Sans** (UI). On mobile use `@expo-google-fonts/fraunces` and `@expo-google-fonts/plus-jakarta-sans`.
- Colours: cream `#fbf6f1`, ivory `#fffdfb`, plum-900 `#2a1428` (primary text and buttons), plum-700 `#4d2649`, plum-500 `#7a4377`, blush-50 `#fdf3f5`, blush-100 `#fbe5ea`, blush-300 `#f0a3b4`, blush-500 `#d45677` (accent), blush-600 `#b93d5f`, sage-100 `#e8efe5`, sage-600 `#5f7d57` (success / verified), peach-100 `#fde9dc`, lilac-100 `#eee8fb`, gold-400 `#e7b45f` (stars).
- Large radii (20–36px), soft 1px rings (`blush-100`), generous whitespace, calm motion. Reuse the Tailwind `@theme` block in `apps/web/src/app/globals.css` for the admin console.
- Status colours: requested = gold/peach, confirmed = lilac, active = sage, completed = plum-300, cancelled = blush.
- Logo: see `apps/web/src/components/layout/Logo.tsx` ("Lasan" in Fraunces + "FAMILY" in tracked caps).

## 6. Admin console spec (`apps/admin`, port 3001)

Next.js 16 App Router, Tailwind v4, `lucide-react`. Desktop-first, responsive down to tablet. A left sidebar with the logo plus: Overview, Bookings, Helpers, Onboarding, Customers, Cities, Services, Waitlist. Top bar with search and the signed-in admin.

- **Login** (`/login`): email + password → `POST /v1/auth/admin`. Store the JWT in an httpOnly cookie set by a Next.js Route Handler or Server Action (`lasan_admin`), and guard every page with `proxy.ts` (Next 16's replacement for middleware: check the docs). Call the API from the server with the cookie token; client components call Server Actions for mutations.
- **Overview**: 6 KPI tiles, 30-day bookings + revenue chart (hand-rolled SVG, like `apps/web/src/app/dashboard/charts.tsx`), revenue by city table, recent bookings.
- **Bookings**: filterable table (status, city, search), and a detail drawer with all fields. *Assign helper* lists active providers in the booking's city, preferring the requested helper. Status actions: confirm, mark completed, cancel.
- **Helpers**: table with status, city, verification badges and active bookings. Toggle Aadhaar/police verification, activate/suspend, edit rate.
- **Onboarding**: kanban board by stage (New → Phone screening → Aadhaar & police check → Skills session → Approved / Rejected). Moving to Approved creates the provider.
- **Customers**: table with bookings count and lifetime value.
- **Cities**: AP and TG sections; switch city status live / waitlist / paused; add localities; show bookings and waitlist leads per city.
- **Services**: edit price, toggle active.
- **Waitlist**: leads table grouped by city, CSV export.
- Dockerfile at `apps/admin/Dockerfile` (same pattern as `apps/web/Dockerfile`; `npm ci --workspace @lasan/admin --workspace @lasan/shared --include-workspace-root`).

## 7. Mobile app spec (`apps/mobile`, Expo SDK 58, React Native 0.88, React 19.3)

Create with `npx create-expo-app@latest apps/mobile --template default` (Expo Router), then rename the package to `@lasan/mobile` so it's in the workspace. Use `expo-secure-store` for the token, `@tanstack/react-query` for data, `lucide-react-native` + `react-native-svg` for icons, and the design system above. `EXPO_PUBLIC_API_URL` defaults to the production API URL. Android package / iOS bundle id: `in.lasanfamily.app`.

**Welcome**: brand screen with two large choices, **"I need help at home" (Customer)** and **"I work with Lasan Family" (Service provider)**. Then phone number → 6-digit OTP. The OTP step calls `GET /auth/config`: if `firebase` is true, use Firebase phone auth (pluggable module, to be wired on Monday: `@react-native-firebase/auth` needs a dev build). Otherwise use `POST /auth/dev`. Show a subtle "Demo: use 123456" hint only when the server reports dev/demo mode. Persist the session, and route by role.

**Customer tabs**
1. **Home**: greeting; today's visits from `/me/home` with the helper card, live status (scheduled / checked in / done) and a timeline of updates (check-in, chores, meal photos with images). Upcoming visits. Pull to refresh, polling every 30s while focused. Call-helper and help/SOS buttons (`tel:` to support for now).
2. **Book**: native booking flow mirroring the website wizard (need → services/plan → frequency, date, slot → city, locality, address, recipient, food/diets → review). Live price via `quote()` from `@lasan/shared`, then `POST /bookings` with the session token.
3. **Bookings**: list with status chips → detail with the visit schedule and updates; cancel.
4. **Account**: profile (name, city, locality, address, food, diets via `PATCH /me/profile`), support contacts, sign out.

**Service-provider tabs**
1. **Today**: today's jobs from `/provider/visits?range=today`, each with recipient, address (tap to open maps), services, diet notes and phone (tap to call). Big **Check in** / **Check out** buttons; add update: chore done, meal served (title, note, optional photo URL; real photo upload comes later), or note.
2. **Schedule**: upcoming 14 days, grouped by date.
3. **Earnings**: this week, this month, visits this month, payout history.
4. **Profile**: provider profile, verification badges, sign out.

Large touch targets, readable font sizes (body ≥ 16), works in Telugu-friendly fonts (system fallback), haptics on key actions, skeleton loaders, friendly empty and error states.
