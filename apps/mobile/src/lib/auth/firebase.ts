/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FIREBASE PHONE AUTH: STUB, TO BE WIRED ON MONDAY
 * ─────────────────────────────────────────────────────────────────────────────
 * The API enables Firebase sign-in once FIREBASE_PROJECT_ID is set
 * (GET /v1/auth/config then returns { firebase: true }).
 *
 * To wire it (see apps/mobile/README.md, "Firebase phone sign-in"):
 *   1. npx expo install @react-native-firebase/app @react-native-firebase/auth expo-build-properties
 *   2. Add the config plugins and google-services.json / GoogleService-Info.plist to app.json
 *   3. Replace the body of this module with:
 *
 *        import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth";
 *        let confirmation: FirebaseAuthTypes.ConfirmationResult | null = null;
 *        export const firebasePhoneAuth: PhoneAuthProvider = {
 *          available: true,
 *          async sendCode(phone) { confirmation = await auth().signInWithPhoneNumber(phone); },
 *          async confirm(code) {
 *            if (!confirmation) throw new FriendlyError("Request a new code and try again.");
 *            const cred = await confirmation.confirm(code);
 *            return cred!.user.getIdToken();
 *          },
 *        };
 *
 *   4. Build an EAS development build (Firebase native modules don't run in Expo Go).
 * Nothing else in the app needs to change: lib/auth/index.ts already calls
 * POST /v1/auth/firebase with the ID token this module returns.
 */

import { FriendlyError } from "../api";

export type PhoneAuthProvider = {
  /** True once the native Firebase module is installed and configured. */
  available: boolean;
  /** Sends the SMS code to an E.164 phone number. */
  sendCode(phone: string): Promise<void>;
  /** Confirms the 6-digit code and returns a Firebase ID token for the API. */
  confirm(code: string): Promise<string>;
};

export const firebasePhoneAuth: PhoneAuthProvider = {
  available: false,
  async sendCode() {
    throw new FriendlyError("SMS sign-in is being set up. Please try again soon.");
  },
  async confirm() {
    throw new FriendlyError("SMS sign-in is being set up. Please try again soon.");
  },
};
