import { useQuery } from "@tanstack/react-query";
import { getAuthConfig } from "./auth";

export const useAuthConfig = () => useQuery({ queryKey: ["auth", "config"], queryFn: getAuthConfig, staleTime: 5 * 60_000 });
