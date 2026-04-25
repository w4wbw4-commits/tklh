// ---------------------------------------------------------------------------
// Bilingual content helpers — picks the EN translation of admin-entered
// content when the active locale is English, otherwise falls back to the
// original Arabic value. Use these for ANY field stored in the DB that has
// an optional `*_en` companion column (e.g. `name_en`, `description_en`,
// `region_en`, `extra_services_en`, …).
//
// Numerals: in addition to translating, we run all returned text through
// `toLatinDigits` so any Arabic-Indic digits embedded in the string get
// normalised to 1/2/3 — matching the platform-wide rule "numbers ALWAYS in
// English numerals, regardless of UI language".
// ---------------------------------------------------------------------------

import i18n from "./index";
import { toLatinDigits } from "./format";

/** True when the UI is currently rendering in English. */
export const isEnglishLocale = () => (i18n.language || "ar").toLowerCase().startsWith("en");

/**
 * Pick the English value when running in EN locale and the EN field has a
 * non-empty trimmed value; otherwise return the Arabic fallback. Never
 * returns `null`/`undefined` for non-empty inputs — callers can pass `?? ""`.
 */
export const pickLocalized = (
  ar: string | null | undefined,
  en: string | null | undefined,
): string => {
  const useEn = isEnglishLocale();
  const enClean = (en ?? "").trim();
  const arClean = (ar ?? "").trim();
  const chosen = useEn && enClean ? enClean : arClean || enClean;
  return toLatinDigits(chosen);
};

/**
 * Same as `pickLocalized` but for arrays. Falls back item-by-item: when EN
 * locale is active, prefer the EN entry at the same index; if missing,
 * use the Arabic entry. Strips empty strings from the result.
 */
export const pickLocalizedArray = (
  ar: string[] | null | undefined,
  en: string[] | null | undefined,
): string[] => {
  const useEn = isEnglishLocale();
  const arr = ar ?? [];
  const eng = en ?? [];
  if (!useEn) return arr.map(toLatinDigits).filter(Boolean);
  // EN locale: prefer EN entry; if EN list shorter or has empty entry, fall back to AR.
  const len = Math.max(arr.length, eng.length);
  const out: string[] = [];
  for (let i = 0; i < len; i++) {
    const eVal = (eng[i] ?? "").trim();
    const aVal = (arr[i] ?? "").trim();
    const chosen = eVal || aVal;
    if (chosen) out.push(toLatinDigits(chosen));
  }
  return out;
};
