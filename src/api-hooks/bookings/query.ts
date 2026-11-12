import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockServer } from "@common/api/mock/server";
import { seatKeys } from "../seats/query";
import type { Booking, CreateBookingInput } from "./model";

export function useCreateBooking() {
  const client = useQueryClient();
  return useMutation<Booking, Error, CreateBookingInput>({
    mutationFn: mockServer.createBooking,
    onSettled: (_data, _error, input) => client.invalidateQueries({ queryKey: seatKeys.map(input.showtimeId) }),
  });
}
