# Status

_Last updated: 31 Oct 2026, 7:30 PM IST_

## Done
- [x] Monorepo, `@lasan/shared`, Hono API with Drizzle on Railway Postgres (PR #1)
- [x] Website rebrand to Lasan Family, AP + Telangana, live API data (PR #2)
- [x] Railway Dockerfiles; API and website auto-deploy from `main` (PR #3)
- [x] Railway services: `api`, `web`, `admin`, `Postgres` (migrated + seeded)
- [x] Admin console (`apps/admin`, HANDOFF §6): login with an httpOnly `lasan_admin` cookie, `proxy.ts` guard, sign-out; Overview, Bookings (filters, detail drawer, assign helper preferring the requested one, confirm / complete / cancel), Helpers, Onboarding kanban, Customers, Cities, Services, Waitlist (CSV export); `apps/admin/Dockerfile`. `BookingDTO` now carries `requestedProviderId`.

- [x] Mobile app (`apps/mobile`, Expo SDK 58, HANDOFF §7): one app with **Customer** and **Service provider** sign-in (welcome → phone → OTP; `GET /auth/config` picks Firebase or `POST /auth/dev`; token in `expo-secure-store`, restored on launch, role-routed with Expo Router groups). Customer: Home (live visit timeline with meal photos, 30 s polling), Book (native wizard priced with `quote()`), Bookings (detail, visits, cancel), Account (profile edit, support, sign out). Provider: Today (check-in/out, post updates, tap to map / call), Schedule (14 days), Earnings, Profile (verification badges). Brand icon and splash. See `apps/mobile/README.md`.
- [x] Root README: setup, admin and mobile sections

## Next, in order
1. [ ] Firebase phone sign-in on mobile (Monday, with the owner): steps in `apps/mobile/README.md`; replace the stub in `apps/mobile/src/lib/auth/firebase.ts`, make an EAS development build
2. [ ] EAS project + `eas.json` build profiles (development / preview / production) once the owner's Expo account exists
3. [ ] Verify the mobile app against production from a network that can reach Railway (see the mobile notes below)

## Later (needs the owner)
- Firebase phone OTP (owner sets up the Firebase project on Monday): `FIREBASE_PROJECT_ID` on the API, `google-services.json` / `GoogleService-Info.plist` for a dev build
- Payments (Razorpay), photo upload storage, push notifications
- Custom domains (lasanfamily.in), Play Store / App Store listings
- A booking can hold only one helper; "both" (maid + cook) bookings may need two helper slots
- Mobile follow-ups: in-app meal photo capture + upload (needs storage), push notifications for check-in / meal updates, masked calling to the helper (today "Call helper" and "Help / SOS" dial the support line), Telugu translations
- Admin console follow-ups (deferred): editing application notes from the board, pagination beyond the API's 300-row cap on Bookings and Customers, a booking's visit schedule in the drawer (needs an admin visits endpoint), multiple admin accounts / roles

## Mobile verification notes (PR "Mobile app (Expo)")
- `tsc --noEmit` passes; `npx expo export --platform android` and `--platform ios` both bundle; `npx expo start` serves the manifest and the Android dev bundle.
- The build sandbox's network policy blocked `api-production-05746.up.railway.app`, so the API round trip was run against the same API code locally (PGlite, seeded, `AUTH_DEV_MODE=false` with `DEMO_PHONES` like production): `scripts/smoke.ts` passed login for both roles, `/me/home`, booking create (total matched `quote()`) and cancel, `/provider/visits`, check-in → update → check-out, the update showing on the customer timeline, and earnings. Every screen of both roles was also rendered and clicked through on Expo web with Playwright.
- To confirm against production: `API_URL=https://api-production-05746.up.railway.app npx tsx apps/mobile/scripts/smoke.ts` (it creates one booking and cancels it immediately, and posts one note on Padma's visit if it is in progress; it doesn't check out unless `SMOKE_CHECKOUT=1`).
- `experiments.typedRoutes` is off: npm nests `expo-router` under `apps/mobile/node_modules`, and Expo CLI's typed-route generator can't resolve it from the repo root.
