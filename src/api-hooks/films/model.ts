import type { ImageSourcePropType } from "react-native";

export type FilmStatus = "now" | "soon";
export type AgeRating = "SU" | "13+" | "17+" | "21+";

// Keys of the built-in demo genres; TMDB films carry localized names instead
export type Genre = "adventure" | "drama" | "thriller" | "crime" | "family" | "horror" | "sci-fi" | "romance";

export interface Film {
  id: string;
  title: string;
  status: FilmStatus;
  releaseDate?: string; // yyyy-MM-dd
  genres: string[]; // localized names
  synopsis: string; // in the requested language, falling back to English
  score: number | null; // 0–10
  poster: ImageSourcePropType;
  backdrop: ImageSourcePropType;
  // Shown on the cinema screen in 3D: a bundled asset id or an image URL
  screenFrame: number | string;
  // Only present on the detail endpoint
  duration: number | null; // minutes
  rating: AgeRating | null;
  director: string | null;
  cast: string[];
}
