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

Setup and run instructions are added as each app lands.
