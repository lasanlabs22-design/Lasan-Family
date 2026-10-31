# Lasan Family mobile app (`@lasan/mobile`)

One Expo app with two sign-ins:

- **Customer** ("I need help at home"): follow today's visits live (check-in, chores, meal photos), book a maid or home cook, manage bookings and the profile.
- **Service provider** ("I work with Lasan Family"): today's homes with address and phone, check in / check out, post updates for the family, the 14-day schedule, earnings and the verification profile.

Expo SDK 58 · React Native 0.88 · React 19.3 · Expo Router · TanStack Query · `@lasan/shared` for types, catalog, pricing (`quote()`) and the API client.

## Run it with Expo Go

```bash
# from the repo root
npm install
npm run start -w @lasan/mobile      # or: npm run dev:mobile
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS). Phone and computer must be on the same network (or run `npx expo start --tunnel` inside `apps/mobile`).

The app talks to the **production API** by default. To use another API (for example a local one on your LAN), copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`, e.g. `http://192.168.1.20:4000`, then restart Expo.

### Demo logins (OTP `123456`)

| Role | Phone | What you'll see |
| --- | --- | --- |
| Customer | `90000 00001` | Srinivas: bookings for his mother in Tirupati with live visits today |
| Service provider | `90000 00101` | Padma R., daily maid in Tirupati, with today's visit |

The "Demo: use 123456" hint only shows while the API reports dev/demo mode and Firebase is off.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run start -w @lasan/mobile` | Expo dev server (Expo Go / dev build) |
| `npm run android -w @lasan/mobile` / `ios` | Dev server and open on an emulator / simulator |
| `npm run typecheck -w @lasan/mobile` | `tsc --noEmit` |
| `npx expo export --platform android` (in `apps/mobile`) | Production JS bundle check |
| `API_URL=… npx tsx apps/mobile/scripts/smoke.ts` (repo root) | API smoke test of the app's flows with the demo accounts. Creates one booking and cancels it straight away, and posts one visit note. |

## How it's put together

```
src/
  app/                       Expo Router routes
    _layout.tsx              fonts, React Query, session, role-based Stack.Protected groups
    index.tsx                redirects to /welcome, /home (customer) or /today (provider)
    (auth)/                  welcome → phone → otp
    (customer)/(tabs)/       home · book · bookings · account
    (customer)/booking/[id]  booking detail, visit timeline, cancel
    (provider)/(tabs)/       today · schedule · earnings · profile
    (provider)/update/[id]   post a chore / meal / note update (modal)
  components/                Screen, Card, Button, Chip, StatusPill, Avatar, EmptyState, Skeleton, Field, …
  lib/
    api.ts                   shared API client + friendly error messages ({ error } from the API)
    session.tsx              token in expo-secure-store, restored on launch, signs out on 401
    auth/index.ts            GET /auth/config decides Firebase vs POST /auth/dev
    auth/firebase.ts         Firebase phone-auth module (stub until Monday, see below)
    queries.ts               React Query hooks; Home and Today poll every 30 s while focused
  theme/                     colours, type scale, spacing, radii (docs/HANDOFF.md §5)
```

Notes:

- Body text is 16 pt or larger, touch targets are at least 48 dp, fonts scale with the system setting (capped at 1.6×). Telugu text falls back to the system font.
- Meal photos are image URLs for now; in-app photo upload comes with the storage work.
- "Call helper" and "Help / SOS" dial the support line (`BRAND.supportPhone` in `@lasan/shared`) until masked calling exists.
- `experiments.typedRoutes` is off: in this npm workspace `expo-router` is installed under `apps/mobile/node_modules`, and Expo CLI's typed-route generator can't resolve it from the repo root.

## Monday: Firebase phone sign-in

The API switches to Firebase as soon as `FIREBASE_PROJECT_ID` is set (`GET /v1/auth/config` then returns `firebase: true`). The app already calls `POST /v1/auth/firebase { idToken, role }`; only the native module needs wiring.

1. **Firebase console**: create the project, enable **Authentication → Phone**, add an Android app (`in.lasanfamily.app`, with the SHA-1 / SHA-256 from `eas credentials`) and an iOS app (`in.lasanfamily.app`). Download `google-services.json` and `GoogleService-Info.plist` into `apps/mobile/` (both are git-ignored; for EAS, upload them as [file secrets](https://docs.expo.dev/eas/environment-variables/#file-environment-variables)).
2. **Install** (inside `apps/mobile`):
   ```bash
   npx expo install @react-native-firebase/app @react-native-firebase/auth expo-build-properties
   ```
3. **Config plugins** in `app.json`:
   ```json
   "android": { "googleServicesFile": "./google-services.json", "package": "in.lasanfamily.app" },
   "ios": { "googleServicesFile": "./GoogleService-Info.plist", "bundleIdentifier": "in.lasanfamily.app" },
   "plugins": [
     "@react-native-firebase/app",
     "@react-native-firebase/auth",
     ["expo-build-properties", { "ios": { "useFrameworks": "static" } }]
   ]
   ```
4. **Code**: replace the stub in `src/lib/auth/firebase.ts` with the implementation in its header comment (`signInWithPhoneNumber` → `confirm(code)` → `getIdToken()`). Nothing else changes.
5. **Development build** (Firebase native modules don't run in Expo Go):
   ```bash
   npx eas-cli@latest build --profile development --platform android   # and/or ios
   ```
   Install the build on the phone and run `npx expo start --dev-client`.
6. **API**: set `FIREBASE_PROJECT_ID` on the Railway `api` service. Keep `DEMO_PHONES` so the demo accounts (and store reviewers) can still sign in with `123456`.
