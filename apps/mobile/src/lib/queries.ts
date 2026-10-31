import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import type { BookingDTO, CityDTO, ProviderDTO, ProviderEarningsDTO, ServiceDTO, VisitDTO } from "@lasan/shared";
import { api } from "./api";

export type ProviderJob = VisitDTO & {
  job: { recipientName: string; phone: string; address: string; services: string[]; food: string | null; diets: string[]; notes: string };
};
export type ProviderMe = ProviderDTO & { status: string; aadhaarVerified: boolean; policeVerified: boolean };
export type Me = {
  id: string;
  role: string;
  name: string;
  phone: string | null;
  email: string | null;
  citySlug: string | null;
  locality: string | null;
  address: string | null;
  food: string | null;
  diets: string[];
  providerId: string | null;
};

export const keys = {
  me: ["me"] as const,
  home: ["me", "home"] as const,
  bookings: ["me", "bookings"] as const,
  booking: (id: string) => ["me", "bookings", id] as const,
  cities: ["cities"] as const,
  services: ["services"] as const,
  providerMe: ["provider", "me"] as const,
  visits: (range: "today" | "upcoming" | "past") => ["provider", "visits", range] as const,
  earnings: ["provider", "earnings"] as const,
};

/** True only while the screen is focused, so polling stops on other tabs. */
export function useIsScreenFocused() {
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  return focused;
}

const POLL_MS = 30_000;

export function useMe() {
  return useQuery({ queryKey: keys.me, queryFn: () => api.get<Me>("/auth/me") });
}

export function useCustomerHome() {
  const focused = useIsScreenFocused();
  return useQuery({
    queryKey: keys.home,
    queryFn: () => api.get<{ today: VisitDTO[]; upcoming: VisitDTO[] }>("/me/home"),
    refetchInterval: focused ? POLL_MS : false,
  });
}

export const useBookings = () => useQuery({ queryKey: keys.bookings, queryFn: () => api.get<BookingDTO[]>("/me/bookings") });

export const useBooking = (id: string) =>
  useQuery({ queryKey: keys.booking(id), queryFn: () => api.get<{ booking: BookingDTO; visits: VisitDTO[] }>(`/me/bookings/${id}`) });

export const useCities = () => useQuery({ queryKey: keys.cities, queryFn: () => api.get<CityDTO[]>("/cities"), staleTime: 10 * 60_000 });
export const useServices = () => useQuery({ queryKey: keys.services, queryFn: () => api.get<ServiceDTO[]>("/services"), staleTime: 10 * 60_000 });

export const useProviderMe = () => useQuery({ queryKey: keys.providerMe, queryFn: () => api.get<ProviderMe>("/provider/me") });

export function useProviderVisits(range: "today" | "upcoming" | "past", poll = false) {
  const focused = useIsScreenFocused();
  return useQuery({
    queryKey: keys.visits(range),
    queryFn: () => api.get<ProviderJob[]>(`/provider/visits?range=${range}`),
    refetchInterval: poll && focused ? POLL_MS : false,
  });
}

export const useEarnings = () => useQuery({ queryKey: keys.earnings, queryFn: () => api.get<ProviderEarningsDTO>("/provider/earnings") });

/** Pull-to-refresh state that only shows the spinner for user-initiated refreshes (not background polling). */
export function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };
  return { refreshing, onRefresh };
}
