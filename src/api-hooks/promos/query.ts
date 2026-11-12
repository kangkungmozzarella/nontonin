import { useQuery } from "@tanstack/react-query";
import { catalog } from "@common/api/catalog";
import { useLang } from "@hooks/use-lang";
import type { Lang } from "@common/api/model";

export const promoKeys = {
  all: (lang: Lang) => ["promos", lang] as const,
};

export function useGetPromos() {
  const lang = useLang();
  return useQuery({ queryKey: promoKeys.all(lang), queryFn: () => catalog.getPromos(lang), staleTime: 10 * 60_000 });
}
