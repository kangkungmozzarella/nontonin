// Film catalogue: real films from TMDB when a token is configured, otherwise
// the built-in demo films. Showtimes and cinemas always come from the mock
// server because TMDB has no cinema schedules.
import { format } from "date-fns";
import i18n from "@locales/index";
import { FilmArt } from "@constants/assets";
import { formatDate } from "@helpers/format";
import type { AgeRating, Film, FilmStatus } from "@api-hooks/films/model";
import type { Promo } from "@api-hooks/promos/model";
import type { Lang } from "./model";
import { MOCK_FILMS, MockFilm } from "./mock/data";
import { TMDB_ENABLED, TmdbGenres, TmdbList, TmdbListMovie, TmdbMovieDetail, tmdbGet, tmdbImage } from "./tmdb/client";

const REGION = "ID";
const LIST_SIZE = 12;
const tmdbLang = (lang: Lang) => (lang === "id" ? "id-ID" : "en-US");
const today = () => format(new Date(), "yyyy-MM-dd");

/* ---------- demo films ---------- */

function fromMock(m: MockFilm, lang: Lang): Film {
  const t = i18n.getFixedT(lang, "common");
  const art = FilmArt[m.id];
  return {
    id: m.id,
    title: m.title,
    status: m.status,
    releaseDate: m.releaseDate,
    genres: m.genres.map((g) => t(`genre.${g}`)),
    synopsis: m.synopsis[lang],
    score: m.score,
    poster: art.poster,
    backdrop: art.still,
    screenFrame: art.still,
    duration: m.duration,
    rating: m.rating,
    director: m.director,
    cast: m.cast,
  };
}

const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 250));

/* ---------- TMDB ---------- */

const genreCache = new Map<Lang, Map<number, string>>();
async function genreNames(lang: Lang) {
  const hit = genreCache.get(lang);
  if (hit) return hit;
  const res = await tmdbGet<TmdbGenres>("/genre/movie/list", { language: tmdbLang(lang) });
  const map = new Map(res.genres.map((g) => [g.id, g.name]));
  genreCache.set(lang, map);
  return map;
}

// Remembers which list a film came from, so its detail page agrees
const statusById = new Map<string, FilmStatus>();

const score = (m: { vote_average: number; vote_count: number }) =>
  m.vote_count >= 20 ? Math.round(m.vote_average * 10) / 10 : null;

function images(m: { poster_path: string | null; backdrop_path: string | null }) {
  const backdrop = tmdbImage(m.backdrop_path, "w1280")!;
  return {
    poster: { uri: tmdbImage(m.poster_path, "w500")! },
    backdrop: { uri: tmdbImage(m.backdrop_path, "w780")! },
    screenFrame: backdrop,
  };
}

// Titles come from English (TMDB falls back to the original script, e.g.
// Japanese, when no Indonesian title exists); synopses prefer the app language.
async function fetchList(status: FilmStatus, lang: Lang): Promise<TmdbListMovie[]> {
  const path = status === "now" ? "/movie/now_playing" : "/movie/upcoming";
  let en = await tmdbGet<TmdbList>(path, { region: REGION, language: "en-US" });
  if (!en.results.length) en = await tmdbGet<TmdbList>(path, { language: "en-US" });
  let list = en.results.filter((m) => m.poster_path && m.backdrop_path);
  if (status === "soon") list = list.filter((m) => m.release_date > today());
  list = list.slice(0, LIST_SIZE);

  if (lang !== "en") {
    const local = await tmdbGet<TmdbList>(path, { region: REGION, language: tmdbLang(lang) });
    const overview = new Map(local.results.map((m) => [m.id, m.overview]));
    list = list.map((m) => ({ ...m, overview: overview.get(m.id) || m.overview }));
  }
  return list;
}

async function tmdbFilms(status: FilmStatus, lang: Lang): Promise<Film[]> {
  const [list, genres] = await Promise.all([fetchList(status, lang), genreNames(lang)]);
  return list.map((m) => {
    statusById.set(String(m.id), status);
    return {
      id: String(m.id),
      title: m.title,
      status,
      releaseDate: m.release_date || undefined,
      genres: m.genre_ids.map((g) => genres.get(g)).filter((g): g is string => !!g),
      synopsis: m.overview,
      score: score(m),
      ...images(m),
      duration: null,
      rating: null,
      director: null,
      cast: [],
    };
  });
}

const ID_RATINGS: AgeRating[] = ["SU", "13+", "17+", "21+"];
const US_TO_ID: Record<string, AgeRating> = { G: "SU", PG: "SU", "PG-13": "13+", R: "17+", "NC-17": "21+" };

function ageRating(d: TmdbMovieDetail): AgeRating | null {
  const certs = (country: string) =>
    d.release_dates?.results.find((r) => r.iso_3166_1 === country)?.release_dates.map((x) => x.certification.trim()) ?? [];
  const id = certs("ID").find((c) => (ID_RATINGS as string[]).includes(c));
  if (id) return id as AgeRating;
  const us = certs("US").find((c) => US_TO_ID[c]);
  return us ? US_TO_ID[us] : null;
}

async function tmdbFilm(id: string, lang: Lang): Promise<Film> {
  const [en, local] = await Promise.all([
    tmdbGet<TmdbMovieDetail>(`/movie/${id}`, { language: "en-US", append_to_response: "credits,release_dates" }),
    lang === "en" ? Promise.resolve(null) : tmdbGet<TmdbMovieDetail>(`/movie/${id}`, { language: tmdbLang(lang) }),
  ]);
  const status = statusById.get(id) ?? (en.release_date && en.release_date <= today() ? "now" : "soon");
  return {
    id,
    title: en.title,
    status,
    releaseDate: en.release_date || undefined,
    genres: (local ?? en).genres.map((g) => g.name),
    synopsis: local?.overview || en.overview,
    score: score(en),
    ...images(en),
    duration: en.runtime || null,
    rating: ageRating(en),
    director: en.credits?.crew.find((c) => c.job === "Director")?.name ?? null,
    cast: (en.credits?.cast ?? []).sort((a, b) => a.order - b.order).slice(0, 5).map((c) => c.name),
  };
}

/* ---------- public API ---------- */

export const catalog = {
  usesTmdb: TMDB_ENABLED,

  getFilms(status: FilmStatus, lang: Lang): Promise<Film[]> {
    if (TMDB_ENABLED) return tmdbFilms(status, lang);
    return delay(MOCK_FILMS.filter((f) => f.status === status).map((f) => fromMock(f, lang)));
  },

  getFilm(id: string, lang: Lang): Promise<Film> {
    const mock = MOCK_FILMS.find((f) => f.id === id);
    if (mock) return delay(fromMock(mock, lang)); // demo ids still resolve, e.g. for old tickets
    if (!TMDB_ENABLED) return Promise.reject(new Error("film not found"));
    return tmdbFilm(id, lang);
  },

  // Home banners, built around whatever is playing
  async getPromos(lang: Lang): Promise<Promo[]> {
    const t = i18n.getFixedT(lang, "home");
    const [now, soon] = await Promise.all([catalog.getFilms("now", lang), catalog.getFilms("soon", lang)]);
    const promos: Promo[] = [];
    if (now[0])
      promos.push({ id: "feature", kind: "feature", film: now[0], title: t("promo.feature.title"), subtitle: t("promo.feature.subtitle", { film: now[0].title }) });
    if (now[1])
      promos.push({ id: "discount", kind: "discount", film: now[1], title: t("promo.discount.title"), subtitle: t("promo.discount.subtitle") });
    if (soon[0])
      promos.push({
        id: "premiere",
        kind: "premiere",
        film: soon[0],
        title: soon[0].title,
        subtitle: t("promo.premiere.subtitle", { date: soon[0].releaseDate ? formatDate(soon[0].releaseDate, "d MMM", lang) : "" }),
      });
    return promos;
  },
};
