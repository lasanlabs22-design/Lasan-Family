export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
export const SESSION_COOKIE = "lasan_admin";
/** Matches the API's admin token lifetime (12h). */
export const SESSION_MAX_AGE = 12 * 60 * 60;
