import type { Localized } from "@common/api/model";

export type FilmStatus = "now" | "soon";
export type AgeRating = "SU" | "13+" | "17+";
export type Genre =
  | "adventure"
  | "drama"
  | "thriller"
  | "crime"
  | "family"
  | "horror"
  | "sci-fi"
  | "romance";

export interface Film {
  id: string;
  title: string;
  status: FilmStatus;
  releaseDate?: string; // yyyy-MM-dd, only for upcoming films
  genres: Genre[];
  duration: number; // minutes
  rating: AgeRating;
  director: string;
  cast: string[];
  synopsis: Localized;
  score: number | null;
}
