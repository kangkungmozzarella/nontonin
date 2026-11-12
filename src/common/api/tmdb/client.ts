// Thin client for The Movie Database (https://developer.themoviedb.org).
// The read token comes from EXPO_PUBLIC_TMDB_TOKEN in .env.local, which is
// git-ignored. Note that EXPO_PUBLIC_ values end up inside the app bundle;
// in production, call TMDB through your own backend instead.

const TOKEN = process.env.EXPO_PUBLIC_TMDB_TOKEN;
const BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export const TMDB_ENABLED = !!TOKEN;

export class TmdbError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function tmdbGet<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ""}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
  });
  if (!res.ok) throw new TmdbError(res.status, `TMDB ${res.status} on ${path}`);
  return (await res.json()) as T;
}

export const tmdbImage = (path: string | null | undefined, size: "w342" | "w500" | "w780" | "w1280") =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

/* ---------- response shapes (only the fields we read) ---------- */

export interface TmdbListMovie {
  id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
}

export interface TmdbList {
  results: TmdbListMovie[];
}

export interface TmdbMovieDetail extends Omit<TmdbListMovie, "genre_ids"> {
  runtime: number | null;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { name: string; order: number }[];
    crew: { name: string; job: string }[];
  };
  release_dates?: {
    results: { iso_3166_1: string; release_dates: { certification: string }[] }[];
  };
}

export interface TmdbGenres {
  genres: { id: number; name: string }[];
}
