import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

export const SUPPORTED_LANGS = ["ar", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: "ar",
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "htmlTag", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "tekillah_lang",
    },
  });

const applyDir = (lng: string) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  if (typeof document !== "undefined") {
    document.documentElement.dir = dir;
    document.documentElement.lang = lng;
  }
};

applyDir(i18n.language || "ar");
i18n.on("languageChanged", applyDir);

export default i18n;
