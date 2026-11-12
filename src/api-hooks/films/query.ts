import { useQuery } from "@tanstack/react-query";
import { mockServer } from "@common/api/mock/server";
import type { FilmStatus } from "./model";

export const filmKeys = {
  list: (status?: FilmStatus) => ["films", status ?? "all"] as const,
  detail: (id: string) => ["film", id] as const,
};

export function useGetFilms(status?: FilmStatus) {
  return useQuery({ queryKey: filmKeys.list(status), queryFn: () => mockServer.getFilms(status) });
}

export function useGetFilm(id: string | undefined) {
  return useQuery({ queryKey: filmKeys.detail(id ?? ""), queryFn: () => mockServer.getFilm(id!), enabled: !!id });
}
