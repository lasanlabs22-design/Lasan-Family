# Lasan Family

Trusted, verified **maids and home cooks for women at home** across **Andhra Pradesh and Telangana**.

This repository is a monorepo holding every part of the platform:

| Path | What it is | Tech |
| --- | --- | --- |
| `apps/web` | Public website: services, helpers, booking | Next.js 16, Tailwind CSS v4 |
| `apps/admin` | Admin console for the operations team | Next.js 16, Tailwind CSS v4 |
| `apps/api` | REST API used by every app | Hono, Drizzle ORM, PostgreSQL (Railway) |
| `apps/mobile` | One app for **customers** and **service providers** | Expo (React Native) |
| `packages/shared` | Brand, geography, catalog, pricing, API types & validation | TypeScript, Zod |

## Getting started

```bash
npm install
cp apps/api/.env.example apps/api/.env   # leave DATABASE_URL empty for embedded PGlite; set ADMIN_PASSWORD
npm run db:seed -w @lasan/api            # first run only
npm run dev:api                          # http://localhost:4000
npm run dev:web                          # http://localhost:3000
npm run dev:admin                        # http://localhost:3001
npm run dev:mobile                       # Expo dev server: scan the QR code with Expo Go
```

See `docs/HANDOFF.md` for architecture and the API reference, and `docs/STATUS.md` for progress.

## Admin console (`apps/admin`)

The operations console for the Lasan Family team: overview KPIs and a 30-day chart, bookings (assign helpers, confirm, complete, cancel), helper verification and rates, the onboarding pipeline, customers, cities and localities, service prices and the waitlist with CSV export.

- Copy `apps/admin/.env.example` to `apps/admin/.env.local` (`NEXT_PUBLIC_API_URL`, defaults to `http://localhost:4000`).
- Sign in with the seeded admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `apps/api/.env`.
- The session JWT lives in an httpOnly `lasan_admin` cookie (12 hours). `src/proxy.ts` guards every page; data is read on the server per request and changed through Server Actions.
- Production: Railway service `admin` builds `apps/admin/Dockerfile` from `main` (https://admin-production-c858f.up.railway.app).

## Mobile app (`apps/mobile`)

One Expo (React Native) app with two sign-ins: **customers** follow each visit live (check-in, chores, meal photos), book a maid or home cook and manage bookings; **service providers** see today's homes, check in and out, post updates for the family, and track their schedule and earnings.

- Run: `npm run start -w @lasan/mobile` (or `npm run dev:mobile`) and scan the QR code with **Expo Go**.
- It uses the production API by default; set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` (see `.env.example`) to point elsewhere.
- Demo logins, OTP `123456`: customer `90000 00001`, service provider `90000 00101`.
- Firebase phone sign-in is a pluggable stub until the Firebase project exists. The Monday steps (React Native Firebase, config plugins, EAS development build, `FIREBASE_PROJECT_ID` on the API) are in `apps/mobile/README.md`.
