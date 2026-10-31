import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "../env";
import { fail } from "./http";

export const firebaseEnabled = Boolean(env.FIREBASE_PROJECT_ID);

/**
 * Verifies a Firebase ID token from phone-number sign-in and returns the verified phone.
 * Only the project ID is needed: Google's public keys are fetched to check the signature.
 */
export async function verifyFirebasePhoneToken(idToken: string) {
  if (!firebaseEnabled) fail(400, "Phone sign-in is not configured on the server");
  const app = getApps()[0] ?? initializeApp({ projectId: env.FIREBASE_PROJECT_ID });
  try {
    const decoded = await getAuth(app).verifyIdToken(idToken);
    if (!decoded.phone_number) fail(400, "This sign-in has no verified phone number");
    return { uid: decoded.uid, phone: decoded.phone_number };
  } catch (e) {
    if (e instanceof Error && "status" in e) throw e;
    fail(401, "Your sign-in has expired. Please request a new OTP.");
  }
}
