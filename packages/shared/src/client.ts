import type { ApiError } from "./api";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public body: ApiError,
  ) {
    super(body.error);
  }
}

/**
 * Tiny typed fetch wrapper used by web, admin and mobile.
 * `token` is the Lasan session JWT (Bearer) when the user is signed in.
 */
export function createApiClient(opts: { baseUrl: string; getToken?: () => string | null | undefined | Promise<string | null | undefined> }) {
  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = await opts.getToken?.();
    const res = await fetch(`${opts.baseUrl.replace(/\/$/, "")}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = res.status === 204 ? null : await res.json().catch(() => ({ error: res.statusText }));
    if (!res.ok) throw new ApiRequestError(res.status, json as ApiError);
    return json as T;
  }
  return {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
    patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
    del: <T>(path: string) => request<T>("DELETE", path),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
