import { useTranslation } from "react-i18next";
import type { Lang } from "@common/api/model";

export function useLang(): Lang {
  const { i18n } = useTranslation();
  return i18n.language === "en" ? "en" : "id";
}
