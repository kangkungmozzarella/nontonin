import { format, parse } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import type { Lang } from "@common/api/model";

export const formatIDR = (n: number) =>
  "Rp" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const parseDay = (date: string) => parse(date, "yyyy-MM-dd", new Date());

const locales = { id: idLocale, en: enUS };

export const formatDate = (date: string, pattern: string, lang: Lang) =>
  format(parseDay(date), pattern, { locale: locales[lang] });

export const formatDuration = (minutes: number, lang: Lang) =>
  `${Math.floor(minutes / 60)}${lang === "id" ? "j" : "h"} ${minutes % 60}m`;

export function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0).replace(".", ",")} km`;
}

// Great-circle distance in kilometers
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
