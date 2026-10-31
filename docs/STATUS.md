# Status

_Last updated: 31 Oct 2026, 6:45 PM IST_

## Done
- [x] Monorepo, `@lasan/shared`, Hono API with Drizzle on Railway Postgres (PR #1)
- [x] Website rebrand to Lasan Family, AP + Telangana, live API data (PR #2)
- [x] Railway Dockerfiles; API and website auto-deploy from `main` (PR #3)
- [x] Railway services: `api`, `web`, `admin`, `Postgres` (migrated + seeded)
- [x] Admin console (`apps/admin`, HANDOFF §6): login with an httpOnly `lasan_admin` cookie, `proxy.ts` guard, sign-out; Overview, Bookings (filters, detail drawer, assign helper preferring the requested one, confirm / complete / cancel), Helpers, Onboarding kanban, Customers, Cities, Services, Waitlist (CSV export); `apps/admin/Dockerfile`. `BookingDTO` now carries `requestedProviderId`.

## Next, in order
1. [ ] Mobile app (`apps/mobile`, Expo): see HANDOFF §7
2. [ ] Root README: mobile section once the app lands

## Later (needs the owner)
- Firebase phone OTP (owner sets up the Firebase project on Monday): `FIREBASE_PROJECT_ID` on the API, `google-services.json` / `GoogleService-Info.plist` for a dev build
- Payments (Razorpay), photo upload storage, push notifications
- Custom domains (lasanfamily.in), Play Store / App Store listings
- A booking can hold only one helper; "both" (maid + cook) bookings may need two helper slots
- Admin console follow-ups (deferred): editing application notes from the board, pagination beyond the API's 300-row cap on Bookings and Customers, a booking's visit schedule in the drawer (needs an admin visits endpoint), multiple admin accounts / roles
