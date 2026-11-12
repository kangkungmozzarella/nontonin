// In-memory stand-in for the booking API. Every function mirrors an endpoint
// the real backend would expose; swap the bodies of the api-hooks queryFns
// for HTTP calls when the API exists.
import { addMinutes, format, isBefore, parse } from "date-fns";
import type { Booking, CreateBookingInput } from "@api-hooks/bookings/model";
import type { SeatMap } from "@api-hooks/seats/model";
import type { Showtime } from "@api-hooks/showtimes/model";
import type { FilmStatus } from "@api-hooks/films/model";
import { SEAT_CELLS, hashString, mulberry } from "@common/theater/layout";
import { priceForShowtime, orderTotals } from "@helpers/pricing";
import { CINEMAS, CITIES, FILMS, PROMOS } from "./data";

const LATENCY = 280;

export class ApiError extends Error {
  constructor(public code: "not_found" | "seat_taken" | "invalid", message?: string) {
    super(message ?? code);
  }
}

function respond<T>(fn: () => T, latency = LATENCY): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (e) {
        reject(e);
      }
    }, latency + Math.random() * 120),
  );
}

function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new ApiError("not_found", `${what} not found`);
  return value;
}

/* ---------- showtime generation ---------- */

const SLOT_TIMES = ["10:15", "11:30", "12:40", "13:50", "15:05", "16:20", "17:45", "19:00", "19:30", "20:15", "21:40"];
const SEP = "~";

export const showtimeId = (cinemaId: string, filmId: string, date: string, time: string) =>
  [cinemaId, filmId, date, time.replace(":", "")].join(SEP);

function parseShowtimeId(id: string) {
  const [cinemaId, filmId, date, hhmm] = id.split(SEP);
  if (!cinemaId || !filmId || !date || !hhmm) throw new ApiError("invalid", "bad showtime id");
  return { cinemaId, filmId, date, time: `${hhmm.slice(0, 2)}:${hhmm.slice(2)}` };
}

function isPast(date: string, time: string) {
  const start = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  return isBefore(start, addMinutes(new Date(), 15));
}

function buildShowtime(cinemaId: string, filmId: string, date: string, time: string): Showtime {
  const cinema = must(CINEMAS.find((c) => c.id === cinemaId), "cinema");
  const studio = 1 + (hashString(cinemaId + filmId) % cinema.studios);
  return { id: showtimeId(cinemaId, filmId, date, time), cinemaId, filmId, date, time, studio, isPast: isPast(date, time) };
}

function showtimesFor(cinemaId: string, filmId: string, date: string): Showtime[] {
  const rnd = mulberry(hashString(cinemaId + filmId + date));
  if (rnd() < 0.15) return []; // not every cinema plays every film every day
  const count = 3 + Math.floor(rnd() * 3);
  const picks = new Set<string>();
  while (picks.size < count) picks.add(SLOT_TIMES[Math.floor(rnd() * SLOT_TIMES.length)]);
  return [...picks].sort().map((t) => buildShowtime(cinemaId, filmId, date, t));
}

/* ---------- seat inventory ---------- */

// Seats sold through this app, keyed by showtime id
const sold = new Map<string, Set<string>>();

function takenSeats(id: string) {
  const { time } = parseShowtimeId(id);
  const rnd = mulberry(hashString(id));
  const evening = Number(time.slice(0, 2)) >= 18;
  const base = (evening ? 0.42 : 0.24) + rnd() * 0.12;
  const taken = new Set<string>();
  for (const s of SEAT_CELLS) {
    const p = s.row < 2 ? base * 0.55 : s.kind === "rec" ? base * 0.85 : base;
    if (rnd() < p) taken.add(s.id);
  }
  // keep a few good seats open so the demo always has something to show
  ["E7", "E8", "F7", "F8"].forEach((id) => taken.delete(id));
  sold.get(id)?.forEach((s) => taken.add(s));
  return taken;
}

let bookingSeq = 0;
const bookingCode = () =>
  "NTN" +
  Date.now().toString(36).slice(-4).toUpperCase() +
  (++bookingSeq).toString(36).toUpperCase().padStart(2, "0");

/* ---------- endpoints ---------- */

export const mockServer = {
  getCities: () => respond(() => CITIES),

  getCinemas: (cityId?: string) =>
    respond(() => (cityId ? CINEMAS.filter((c) => c.cityId === cityId) : CINEMAS)),

  getCinema: (id: string) => respond(() => must(CINEMAS.find((c) => c.id === id), "cinema")),

  getFilms: (status?: FilmStatus) =>
    respond(() => (status ? FILMS.filter((f) => f.status === status) : FILMS)),

  getFilm: (id: string) => respond(() => must(FILMS.find((f) => f.id === id), "film")),

  getPromos: () => respond(() => PROMOS),

  // Showtimes for one film across all cinemas in a city
  getFilmSchedule: (filmId: string, cityId: string, date: string) =>
    respond(() =>
      CINEMAS.filter((c) => c.cityId === cityId)
        .map((cinema) => ({ cinema, showtimes: showtimesFor(cinema.id, filmId, date) }))
        .filter((x) => x.showtimes.length > 0),
    ),

  // Showtimes for every film playing at one cinema
  getCinemaSchedule: (cinemaId: string, date: string) =>
    respond(() =>
      FILMS.filter((f) => f.status === "now")
        .map((film) => ({ film, showtimes: showtimesFor(cinemaId, film.id, date) }))
        .filter((x) => x.showtimes.length > 0),
    ),

  getShowtime: (id: string) =>
    respond(() => {
      const p = parseShowtimeId(id);
      return buildShowtime(p.cinemaId, p.filmId, p.date, p.time);
    }),

  getSeatMap: (id: string) =>
    respond((): SeatMap => {
      const p = parseShowtimeId(id);
      const cinema = must(CINEMAS.find((c) => c.id === p.cinemaId), "cinema");
      const { price, discountPercent } = priceForShowtime(cinema.tier, p.date);
      return { showtimeId: id, taken: [...takenSeats(id)], price, discountPercent };
    }),

  createBooking: (input: CreateBookingInput) =>
    respond((): Booking => {
      const p = parseShowtimeId(input.showtimeId);
      const cinema = must(CINEMAS.find((c) => c.id === p.cinemaId), "cinema");
      if (!input.seats.length) throw new ApiError("invalid", "no seats");
      const taken = takenSeats(input.showtimeId);
      if (input.seats.some((s) => taken.has(s))) throw new ApiError("seat_taken");

      const pricing = priceForShowtime(cinema.tier, p.date);
      const totals = orderTotals(input.seats, pricing);
      const set = sold.get(input.showtimeId) ?? new Set<string>();
      input.seats.forEach((s) => set.add(s));
      sold.set(input.showtimeId, set);

      const code = bookingCode();
      return {
        id: code,
        code,
        showtimeId: input.showtimeId,
        filmId: p.filmId,
        cinemaId: p.cinemaId,
        date: p.date,
        time: p.time,
        studio: buildShowtime(p.cinemaId, p.filmId, p.date, p.time).studio,
        seats: [...input.seats].sort(),
        ...totals,
        payment: input.payment,
        createdAt: new Date().toISOString(),
      };
    }, 1100),

  // Tell the mock server about bookings restored from device storage
  restoreBookings(bookings: Booking[]) {
    for (const b of bookings) {
      const set = sold.get(b.showtimeId) ?? new Set<string>();
      b.seats.forEach((s) => set.add(s));
      sold.set(b.showtimeId, set);
    }
  },
};

export const todayKey = () => format(new Date(), "yyyy-MM-dd");
