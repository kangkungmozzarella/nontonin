import { useQuery } from "@tanstack/react-query";
import { mockServer } from "@common/api/mock/server";

export const cityKeys = {
  all: () => ["cities"] as const,
};

export function useGetCities() {
  return useQuery({ queryKey: cityKeys.all(), queryFn: mockServer.getCities, staleTime: Infinity });
}
