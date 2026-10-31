# Status

_Last updated: 31 Oct 2026 (final verification pass)_

## Done
- [x] Monorepo, `@lasan/shared`, Hono API with Drizzle on Railway Postgres (PR #1)
- [x] Website rebrand to Lasan Family, AP + Telangana, live API data (PR #2)
- [x] Railway Dockerfiles; API and website auto-deploy from `main` (PR #3)
- [x] Railway services: `api`, `web`, `admin`, `Postgres` (migrated + seeded)
- [x] Admin console (`apps/admin`, HANDOFF §6): login with an httpOnly `lasan_admin` cookie, `proxy.ts` guard, sign-out; Overview, Bookings (filters, detail drawer, assign helper preferring the requested one, confirm / complete / cancel), Helpers, Onboarding kanban, Customers, Cities, Services, Waitlist (CSV export); `apps/admin/Dockerfile`. `BookingDTO` now carries `requestedProviderId`.

- [x] Mobile app (`apps/mobile`, Expo SDK 58, HANDOFF §7): one app with **Customer** and **Service provider** sign-in (welcome → phone → OTP; `GET /auth/config` picks Firebase or `POST /auth/dev`; token in `expo-secure-store`, restored on launch, role-routed with Expo Router groups). Customer: Home (live visit timeline with meal photos, 30 s polling), Book (native wizard priced with `quote()`), Bookings (detail, visits, cancel), Account (profile edit, support, sign out). Provider: Today (check-in/out, post updates, tap to map / call), Schedule (14 days), Earnings, Profile (verification badges). Brand icon and splash. See `apps/mobile/README.md`.
- [x] Root README documents every app: what it is, how to run it, env vars, production URLs, demo logins, checks
- [x] Final verification (31 Oct, PR "Final verification and polish"): clean `npm install`; `npm run typecheck` passes in all five workspaces; `next build` passes for web and admin; `expo export --platform android` bundles. Production smoke test: API `/health` (postgres) and `/v1/cities` 200; website and admin `/login` serve 200 HTML; admin redirects signed-out visitors to `/login`; both demo logins work; `apps/mobile/scripts/smoke.ts` passed end to end against the production API. Fixed: the Next apps' `typecheck` now runs `next typegen` first, so it passes on a fresh checkout (the `PageProps` / `LayoutProps` globals are generated).

## Needs the owner
1. [ ] **Firebase phone OTP (Monday)**: create the Firebase project, enable phone sign-in, set `FIREBASE_PROJECT_ID` on the Railway `api` service, add `google-services.json` / `GoogleService-Info.plist`, then wire `apps/mobile/src/lib/auth/firebase.ts` and make an EAS development build (steps in `apps/mobile/README.md`). Until then only the `DEMO_PHONES` numbers can sign in on mobile.
2. [ ] **Payments**: a Razorpay account and keys; nothing is charged today (bookings are requested, then confirmed by ops).
3. [ ] **Custom domain**: buy / point `lasanfamily.in` (and e.g. `admin.` / `api.` subdomains) at the Railway services, then add the new origins to the API's `CORS_ORIGINS`.
4. [ ] **App-store accounts**: an Expo (EAS) account, a Google Play developer account and an Apple Developer account, so we can add `eas.json` build profiles and publish `in.lasanfamily.app`.

## Next (engineering, after the owner's steps)
1. [ ] Firebase sign-in on mobile and an EAS development build
2. [ ] `eas.json` build profiles (development / preview / production) and store listings
3. [ ] Photo upload storage (meal photos), push notifications, Razorpay checkout

## Later / known gaps
- A booking can hold only one helper; "both" (maid + cook) bookings may need two helper slots
- Mobile follow-ups: in-app meal photo capture + upload (needs storage), push notifications for check-in / meal updates, masked calling to the helper (today "Call helper" and "Help / SOS" dial the support line), Telugu translations
- Admin console follow-ups: editing application notes from the board, pagination beyond the API's 300-row cap on Bookings and Customers, a booking's visit schedule in the drawer (needs an admin visits endpoint), multiple admin accounts / roles

## Mobile verification notes (PR "Mobile app (Expo)")
- `tsc --noEmit` passes; `npx expo export --platform android` and `--platform ios` both bundle; `npx expo start` serves the manifest and the Android dev bundle.
- The build sandbox's network policy blocked `api-production-05746.up.railway.app`, so the API round trip was run against the same API code locally (PGlite, seeded, `AUTH_DEV_MODE=false` with `DEMO_PHONES` like production): `scripts/smoke.ts` passed login for both roles, `/me/home`, booking create (total matched `quote()`) and cancel, `/provider/visits`, check-in → update → check-out, the update showing on the customer timeline, and earnings. Every screen of both roles was also rendered and clicked through on Expo web with Playwright.
- Confirmed against production on 31 Oct (see Done). To re-run: `API_URL=https://api-production-05746.up.railway.app npx tsx apps/mobile/scripts/smoke.ts` (it creates one booking and cancels it immediately, and posts one note on Padma's visit if it is in progress; it doesn't check out unless `SMOKE_CHECKOUT=1`).
- `experiments.typedRoutes` is off: npm nests `expo-router` under `apps/mobile/node_modules`, and Expo CLI's typed-route generator can't resolve it from the repo root.
