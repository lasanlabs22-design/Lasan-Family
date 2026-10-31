# Lasan Family

Trusted, verified **maids and home cooks for women at home** across **Andhra Pradesh and Telangana**.

This repository is a monorepo (npm workspaces, Node 22) holding every part of the platform:

| Path | What it is | Tech | Production |
| --- | --- | --- | --- |
| `apps/web` | Public website: services, helpers, booking, applications | Next.js 16, Tailwind CSS v4 | https://web-production-d4f12.up.railway.app |
| `apps/admin` | Admin console for the operations team | Next.js 16, Tailwind CSS v4 | https://admin-production-c858f.up.railway.app |
| `apps/api` | REST API used by every app (`/v1`) | Hono, Drizzle ORM, PostgreSQL | https://api-production-05746.up.railway.app |
| `apps/mobile` | One app for **customers** and **service providers** | Expo SDK 58 (React Native) | Expo Go for now; store builds pending |
| `packages/shared` | Brand, geography, catalog, pricing, API types, validation, fetch client | TypeScript, Zod | n/a |

See `docs/HANDOFF.md` for architecture, the API reference and the design system, and `docs/STATUS.md` for progress and what needs the owner.

## Getting started

```bash
npm install                              # once, at the repo root
cp apps/api/.env.example apps/api/.env   # leave DATABASE_URL empty for embedded PGlite; set ADMIN_PASSWORD
npm run db:seed -w @lasan/api            # first run only (migrations run on boot)
npm run dev:api                          # http://localhost:4000
npm run dev:web                          # http://localhost:3000
npm run dev:admin                        # http://localhost:3001
npm run dev:mobile                       # Expo dev server: scan the QR code with Expo Go
```

## Demo logins

| Who | Where | Login |
| --- | --- | --- |
| Customer (Srinivas, two active bookings for his mother in Tirupati) | mobile app | `+91 90000 00001`, OTP `123456` |
| Service provider (Padma R., daily maid in Tirupati) | mobile app | `+91 90000 00101`, OTP `123456` |
| Admin | admin console | `ADMIN_EMAIL` / `ADMIN_PASSWORD` set on the API (seeded by `db:seed`) |

In production, OTP `123456` works only for the numbers in the API's `DEMO_PHONES`. Locally, with `AUTH_DEV_MODE=true`, it works for any number.

## API (`apps/api`)

Hono REST API on PostgreSQL (Railway Postgres in production, embedded PGlite locally when `DATABASE_URL` is empty). Public catalog and booking endpoints, phone sign-in for customers and providers, and admin endpoints. Health check: `GET /health`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string; empty = embedded PGlite in `apps/api/.pglite` |
| `PORT` | Defaults to `4000` |
| `JWT_SECRET` | Signs session tokens (`openssl rand -base64 48`) |
| `CORS_ORIGINS` | Comma-separated origins allowed to call the API |
| `FIREBASE_PROJECT_ID` | Enables Firebase phone OTP (empty until the owner sets it up) |
| `AUTH_DEV_MODE` | `true` locally only: OTP `123456` for any phone. Must be `false` in production |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account, created by `db:seed` |
| `DEMO_PHONES` | Numbers allowed to use OTP `123456` in production |

Scripts: `npm run dev:api`, `npm run db:seed`, `npm run db:generate` (new migration after a schema change), `npm run build -w @lasan/api`.

## Website (`apps/web`)

The public site: home, services and prices, verified helpers, a booking wizard priced live from `@lasan/shared`, and the "become a helper" application.

- Env: `NEXT_PUBLIC_API_URL` (copy `apps/web/.env.example` to `.env.local`; defaults to `http://localhost:4000`).
- Run: `npm run dev:web`. Build: `npm run build -w @lasan/web`.

## Admin console (`apps/admin`)

The operations console: overview KPIs and a 30-day chart, bookings (assign helpers, confirm, complete, cancel), helper verification and rates, the onboarding pipeline, customers, cities and localities, service prices and the waitlist with CSV export.

- Env: `NEXT_PUBLIC_API_URL` (copy `apps/admin/.env.example` to `.env.local`; defaults to `http://localhost:4000`).
- Run: `npm run dev:admin`, then sign in with the seeded admin.
- The session JWT lives in an httpOnly `lasan_admin` cookie (12 hours). `src/proxy.ts` guards every page; data is read on the server per request and changed through Server Actions.

## Mobile app (`apps/mobile`)

One Expo app with two sign-ins: **customers** follow each visit live (check-in, chores, meal photos), book a maid or home cook and manage bookings; **service providers** see today's homes, check in and out, post updates for the family, and track their schedule and earnings.

- Run: `npm run dev:mobile` and scan the QR code with **Expo Go**.
- Env: `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` (see `.env.example`); defaults to the production API.
- Firebase phone sign-in is a pluggable stub until the Firebase project exists. The setup steps are in `apps/mobile/README.md`.
- End-to-end check against an API: `API_URL=https://api-production-05746.up.railway.app npx tsx apps/mobile/scripts/smoke.ts` (creates one booking and cancels it).

## Checks before merging

```bash
npm run typecheck                                  # every workspace (Next apps run `next typegen` first)
NEXT_PUBLIC_API_URL=https://api-production-05746.up.railway.app npm run build -w @lasan/web
NEXT_PUBLIC_API_URL=https://api-production-05746.up.railway.app npm run build -w @lasan/admin
cd apps/mobile && npx expo export --platform android
```

## Deploying

Railway project `lasan-family` deploys **automatically from `main`**. Each service builds a Dockerfile from the repo root, picked with `RAILWAY_DOCKERFILE_PATH`: `apps/api/Dockerfile`, `apps/web/Dockerfile`, `apps/admin/Dockerfile`. Web and admin receive `NEXT_PUBLIC_API_URL` as a build arg. Work on a branch, open a PR into `main`, and squash-merge it (see `CLAUDE.md`).
