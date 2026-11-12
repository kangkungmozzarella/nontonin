import type { ImageSourcePropType } from "react-native";
import type { Film } from "../films/model";

export type PaymentMethod = "ewallet" | "qris" | "va" | "card";

export interface Booking {
  id: string;
  code: string;
  showtimeId: string;
  filmId: string;
  cinemaId: string;
  // Snapshot at purchase time, so tickets still render after a film leaves the catalogue
  filmTitle: string;
  poster: ImageSourcePropType;
  backdrop: ImageSourcePropType;
  cinemaName: string;
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
  film: Pick<Film, "title" | "poster" | "backdrop">;
}
