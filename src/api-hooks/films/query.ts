import { useQuery } from "@tanstack/react-query";
import { catalog } from "@common/api/catalog";
import { useLang } from "@hooks/use-lang";
import type { Lang } from "@common/api/model";
import type { FilmStatus } from "./model";

export const filmKeys = {
  list: (status: FilmStatus, lang: Lang) => ["films", status, lang] as const,
  detail: (id: string, lang: Lang) => ["film", id, lang] as const,
};

export function useGetFilms(status: FilmStatus) {
  const lang = useLang();
  return useQuery({ queryKey: filmKeys.list(status, lang), queryFn: () => catalog.getFilms(status, lang), staleTime: 10 * 60_000 });
}

export function useGetFilm(id: string | undefined) {
  const lang = useLang();
  return useQuery({
    queryKey: filmKeys.detail(id ?? "", lang),
    queryFn: () => catalog.getFilm(id!, lang),
    enabled: !!id,
    staleTime: 10 * 60_000,
  });
}
