import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { localStorage, StorageKeys } from "@helpers/local-storage";
import type { Lang } from "@common/api/model";
import idCommon from "./id/common";
import idHome from "./id/home";
import idBooking from "./id/booking";
import idAccount from "./id/account";
import enCommon from "./en/common";
import enHome from "./en/home";
import enBooking from "./en/booking";
import enAccount from "./en/account";

// A dedicated instance instead of the global default export
const i18n = createInstance();

export const resources = {
  id: { common: idCommon, home: idHome, booking: idBooking, account: idAccount },
  en: { common: enCommon, home: enHome, booking: enBooking, account: enAccount },
} as const;

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "id", label: "Bahasa Indonesia" },
  { code: "en", label: "English" },
];

// Saved choice first, then the device language, Indonesian otherwise
export function initialLanguage(): Lang {
  const saved = localStorage.getItem(StorageKeys.language);
  if (saved === "id" || saved === "en") return saved;
  return getLocales()[0]?.languageCode === "en" ? "en" : "id";
}

// Called after local storage is hydrated so the saved language is known
export function initI18n() {
  if (i18n.isInitialized) return i18n;
  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage(),
    fallbackLng: "id",
    ns: ["common", "home", "booking", "account"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    returnObjects: true,
  });
  return i18n;
}

export function setLanguage(lang: Lang) {
  localStorage.setItem(StorageKeys.language, lang);
  i18n.changeLanguage(lang);
}

export default i18n;
