import type { Film } from "../films/model";

export interface Promo {
  id: string;
  kind: "feature" | "discount" | "premiere";
  film: Film;
  title: string;
  subtitle: string;
}
