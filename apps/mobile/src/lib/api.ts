import { ApiRequestError, createApiClient } from "@lasan/shared";
import { API_URL } from "./config";

let sessionToken: string | null = null;

/** The session provider keeps this in sync with the token in secure storage. */
export function setApiToken(token: string | null) {
  sessionToken = token;
}

export const api = createApiClient({ baseUrl: `${API_URL}/v1`, getToken: () => sessionToken });

/** An error whose message is already written for people (safe to show as-is). */
export class FriendlyError extends Error {}

/** A short, friendly message for any error thrown by the API client or the network. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiRequestError) {
    if (err.body?.error) return err.body.error;
    if (err.status === 401) return "Please sign in again.";
    return "Something went wrong. Please try again.";
  }
  if (err instanceof FriendlyError) return err.message;
  return "We couldn't reach Lasan Family. Check your internet connection and try again.";
}

let onUnauthorized: (() => void) | null = null;
/** Registered by the session provider: a 401 from any query signs the user out. */
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}
export function handleQueryError(err: unknown) {
  if (isUnauthorized(err) && sessionToken) onUnauthorized?.();
}

export const isUnauthorized = (err: unknown) => err instanceof ApiRequestError && err.status === 401;
