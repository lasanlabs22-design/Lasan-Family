import { cacheLife } from "next/cache";
import { CITIES, stateName, type CityDTO, type ProviderDTO } from "@lasan/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/v1${path}`);
  if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);
  return res.json() as Promise<T>;
}

/** Live geography from the API; falls back to the launch defaults if the API is unreachable. */
export async function getCities(): Promise<CityDTO[]> {
  "use cache";
  cacheLife("minutes");
  try {
    return await get<CityDTO[]>("/cities");
  } catch {
    return CITIES.map((c) => ({ ...c, stateName: stateName(c.state) }));
  }
}

export async function getProviders(city?: string): Promise<ProviderDTO[]> {
  "use cache";
  cacheLife("minutes");
  try {
    return await get<ProviderDTO[]>(`/providers${city ? `?city=${encodeURIComponent(city)}` : ""}`);
  } catch {
    return [];
  }
}
