import { useQuery } from "@tanstack/react-query";
import { mockServer } from "@common/api/mock/server";

export const promoKeys = {
  all: () => ["promos"] as const,
};

export function useGetPromos() {
  return useQuery({ queryKey: promoKeys.all(), queryFn: mockServer.getPromos });
}
