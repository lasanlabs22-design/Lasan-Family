import type { AuthResponse } from "@lasan/shared";
import { api } from "../api";
import { firebasePhoneAuth } from "./firebase";

export type AppRole = "customer" | "provider";
export type AuthConfig = { firebase: boolean; devMode: boolean; demo: boolean };

export const getAuthConfig = () => api.get<AuthConfig>("/auth/config");

/** Which method the OTP step should use for this server. */
export function otpMethod(config: AuthConfig): "firebase" | "dev" {
  if (config.firebase && firebasePhoneAuth.available) return "firebase";
  return "dev";
}

/** Step 1: ask for a code. With the fixed demo/dev OTP there is nothing to send. */
export async function sendCode(phone: string, config: AuthConfig) {
  if (otpMethod(config) === "firebase") await firebasePhoneAuth.sendCode(phone);
}

/** Step 2: exchange the 6-digit code for a Lasan session. */
export async function verifyCode(input: { phone: string; role: AppRole; code: string; config: AuthConfig }): Promise<AuthResponse> {
  if (otpMethod(input.config) === "firebase") {
    const idToken = await firebasePhoneAuth.confirm(input.code);
    return api.post<AuthResponse>("/auth/firebase", { idToken, role: input.role });
  }
  return api.post<AuthResponse>("/auth/dev", { phone: input.phone, role: input.role, code: input.code });
}
