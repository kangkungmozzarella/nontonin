import React from "react";
import { localStorage, StorageKeys } from "@helpers/local-storage";
import { mockServer } from "@common/api/mock/server";
import type { Booking } from "@api-hooks/bookings/model";

interface BookingsContextValue {
  bookings: Booking[];
  add: (b: Booking) => void;
  clear: () => void;
}

const BookingsContext = React.createContext<BookingsContextValue>({ bookings: [], add: () => {}, clear: () => {} });

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = React.useState<Booking[]>(() => {
    const saved = localStorage.getJSON<Booking[]>(StorageKeys.bookings, []);
    mockServer.restoreBookings(saved); // keep seats bought earlier marked as taken
    return saved;
  });

  const add = React.useCallback((b: Booking) => {
    setBookings((prev) => {
      const next = [b, ...prev];
      localStorage.setJSON(StorageKeys.bookings, next);
      return next;
    });
  }, []);

  const clear = React.useCallback(() => {
    localStorage.removeItem(StorageKeys.bookings);
    setBookings([]);
  }, []);

  const value = React.useMemo(() => ({ bookings, add, clear }), [bookings, add, clear]);
  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export const useBookings = () => React.useContext(BookingsContext);
