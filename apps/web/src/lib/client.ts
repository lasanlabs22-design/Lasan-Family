import { createApiClient } from "@lasan/shared";

/** Browser-side API client for form submissions (bookings, waitlist, applications). */
export const api = createApiClient({ baseUrl: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/v1` });
