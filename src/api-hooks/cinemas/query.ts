import { useQuery } from "@tanstack/react-query";
import { mockServer } from "@common/api/mock/server";

export const cinemaKeys = {
  list: (cityId?: string) => ["cinemas", cityId ?? "all"] as const,
  detail: (id: string) => ["cinema", id] as const,
};

export function useGetCinemas(cityId?: string) {
  return useQuery({
    queryKey: cinemaKeys.list(cityId),
    queryFn: () => mockServer.getCinemas(cityId),
    staleTime: Infinity,
  });
}

export function useGetCinema(id: string | undefined) {
  return useQuery({
    queryKey: cinemaKeys.detail(id ?? ""),
    queryFn: () => mockServer.getCinema(id!),
    enabled: !!id,
    staleTime: Infinity,
  });
}
