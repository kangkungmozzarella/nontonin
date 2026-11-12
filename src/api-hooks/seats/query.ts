import { useQuery } from "@tanstack/react-query";
import { mockServer } from "@common/api/mock/server";

export const seatKeys = {
  map: (showtimeId: string) => ["seat-map", showtimeId] as const,
};

// Seat availability changes fast in a real cinema, so never treat it as fresh
export function useGetSeatMap(showtimeId: string) {
  return useQuery({
    queryKey: seatKeys.map(showtimeId),
    queryFn: () => mockServer.getSeatMap(showtimeId),
    staleTime: 0,
  });
}
