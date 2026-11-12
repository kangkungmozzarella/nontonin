export interface Showtime {
  id: string;
  cinemaId: string;
  filmId: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  studio: number;
  isPast: boolean;
}
