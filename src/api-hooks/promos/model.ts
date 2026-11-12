import type { Localized } from "@common/api/model";

export interface Promo {
  id: string;
  filmId: string;
  kind: "feature" | "discount" | "premiere";
  title: Localized;
  subtitle: Localized;
}
