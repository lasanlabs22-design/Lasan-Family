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
```

See `docs/HANDOFF.md` for architecture and the API reference, and `docs/STATUS.md` for progress.

## Admin console (`apps/admin`)

The operations console for the Lasan Family team: overview KPIs and a 30-day chart, bookings (assign helpers, confirm, complete, cancel), helper verification and rates, the onboarding pipeline, customers, cities and localities, service prices and the waitlist with CSV export.

- Copy `apps/admin/.env.example` to `apps/admin/.env.local` (`NEXT_PUBLIC_API_URL`, defaults to `http://localhost:4000`).
- Sign in with the seeded admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `apps/api/.env`.
- The session JWT lives in an httpOnly `lasan_admin` cookie (12 hours). `src/proxy.ts` guards every page; data is read on the server per request and changed through Server Actions.
- Production: Railway service `admin` builds `apps/admin/Dockerfile` from `main` (https://admin-production-c858f.up.railway.app).
