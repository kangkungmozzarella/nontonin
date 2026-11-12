import { useQuery } from "@tanstack/react-query";
import { mockServer } from "@common/api/mock/server";

export const showtimeKeys = {
  byFilm: (filmId: string, cityId: string, date: string) => ["schedule", "film", filmId, cityId, date] as const,
  byCinema: (cinemaId: string, date: string) => ["schedule", "cinema", cinemaId, date] as const,
  detail: (id: string) => ["showtime", id] as const,
};

export function useGetFilmSchedule(filmId: string, cityId: string | undefined, date: string) {
  return useQuery({
    queryKey: showtimeKeys.byFilm(filmId, cityId ?? "", date),
    queryFn: () => mockServer.getFilmSchedule(filmId, cityId!, date),
    enabled: !!cityId,
  });
}

export function useGetCinemaSchedule(cinemaId: string, date: string) {
  return useQuery({
    queryKey: showtimeKeys.byCinema(cinemaId, date),
    queryFn: () => mockServer.getCinemaSchedule(cinemaId, date),
  });
}

export function useGetShowtime(id: string) {
  return useQuery({ queryKey: showtimeKeys.detail(id), queryFn: () => mockServer.getShowtime(id) });
}
