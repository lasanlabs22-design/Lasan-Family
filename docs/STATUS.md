# Status

_Last updated: 31 Oct 2026, 5:40 PM IST_

## Done
- [x] Monorepo, `@lasan/shared`, Hono API with Drizzle on Railway Postgres (PR #1)
- [x] Website rebrand to Lasan Family, AP + Telangana, live API data (PR #2)
- [x] Railway Dockerfiles; API and website auto-deploy from `main` (PR #3)
- [x] Railway services: `api`, `web`, `admin` (admin waits for `apps/admin/Dockerfile`), `Postgres` (migrated + seeded)

## Next, in order
1. [ ] Admin console (`apps/admin`): see HANDOFF §6
2. [ ] Mobile app (`apps/mobile`, Expo): see HANDOFF §7
3. [ ] Root README: setup, scripts, deploy notes

## Later (needs the owner)
- Firebase phone OTP (owner sets up the Firebase project on Monday): `FIREBASE_PROJECT_ID` on the API, `google-services.json` / `GoogleService-Info.plist` for a dev build
- Payments (Razorpay), photo upload storage, push notifications
- Custom domains (lasanfamily.in), Play Store / App Store listings
- A booking can hold only one helper; "both" (maid + cook) bookings may need two helper slots
