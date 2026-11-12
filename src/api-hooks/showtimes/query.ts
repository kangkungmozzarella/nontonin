import { useQuery } from "@tanstack/react-query";
import { mockServer } from "@common/api/mock/server";
import { useGetFilms } from "../films/query";

export const showtimeKeys = {
  byFilm: (filmId: string, cityId: string, date: string) => ["schedule", "film", filmId, cityId, date] as const,
  byCinema: (cinemaId: string, date: string, filmIds: string[]) => ["schedule", "cinema", cinemaId, date, filmIds] as const,
  detail: (id: string) => ["showtime", id] as const,
};

export function useGetFilmSchedule(filmId: string, cityId: string | undefined, date: string) {
  return useQuery({
    queryKey: showtimeKeys.byFilm(filmId, cityId ?? "", date),
    queryFn: () => mockServer.getFilmSchedule(filmId, cityId!, date),
    enabled: !!cityId,
  });
}

// Schedule for the films currently playing; waits until that list is loaded
export function useGetCinemaSchedule(cinemaId: string, date: string) {
  const films = useGetFilms("now");
  const schedule = useQuery({
    queryKey: showtimeKeys.byCinema(cinemaId, date, (films.data ?? []).map((f) => f.id)),
    queryFn: () => mockServer.getCinemaSchedule(cinemaId, date, films.data!),
    enabled: !!films.data,
  });
  return {
    ...schedule,
    isLoading: films.isLoading || schedule.isLoading,
    error: films.error ?? schedule.error,
    refetch: films.error ? films.refetch : schedule.refetch,
  };
}

export function useGetShowtime(id: string) {
  return useQuery({ queryKey: showtimeKeys.detail(id), queryFn: () => mockServer.getShowtime(id) });
}
