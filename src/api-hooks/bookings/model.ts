export type PaymentMethod = "ewallet" | "qris" | "va" | "card";

export interface Booking {
  id: string;
  code: string;
  showtimeId: string;
  filmId: string;
  cinemaId: string;
  date: string;
  time: string;
  studio: number;
  seats: string[];
  subtotal: number;
  discount: number;
  fee: number;
  total: number;
  payment: PaymentMethod;
  createdAt: string; // ISO
}

export interface CreateBookingInput {
  showtimeId: string;
  seats: string[];
  payment: PaymentMethod;
}
