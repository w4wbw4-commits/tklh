// Number/date formatting helpers — ALWAYS render Latin (English) digits,
// regardless of UI language, per product preference.
import i18n from "./index";

// Always Latin digits. Use en-US for numbers so we get "1,234" style grouping.
export const fmtNumber = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

export const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

// Locale that keeps Arabic month/weekday words but forces Latin digits in AR mode.
const dateLocale = () => (i18n.language?.startsWith("ar") ? "ar-SA-u-nu-latn" : "en-US");

// Default date display: DD/MM/YYYY with Latin digits in BOTH languages.
export const fmtDate = (
  d: string | number | Date,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" },
) => {
  const date = d instanceof Date ? d : new Date(d);
  // Force en-GB for the numeric DD/MM/YYYY default so AR users still see "21/04/2026".
  const isNumericDefault =
    options.day === "2-digit" && options.month === "2-digit" && options.year === "numeric";
  const locale = isNumericDefault ? "en-GB" : dateLocale();
  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const fmtDateLong = (d: string | number | Date) =>
  fmtDate(d, { year: "numeric", month: "long", day: "numeric" });

export const fmtDateTime = (d: string | number | Date) =>
  fmtDate(d, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

const RTF_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

export const fmtRelative = (d: string | number | Date) => {
  const date = d instanceof Date ? d : new Date(d);
  const diffSec = (date.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(dateLocale(), { numeric: "auto" });
  for (const [unit, sec] of RTF_UNITS) {
    if (Math.abs(diffSec) >= sec || unit === "second") {
      return rtf.format(Math.round(diffSec / sec), unit);
    }
  }
  return fmtDate(date);
};

// Force Latin digits on any string (e.g. user-entered phone numbers stored as ٠٥٥٤...).
export const toLatinDigits = (input: string | number | null | undefined): string => {
  if (input === null || input === undefined) return "";
  const s = String(input);
  return s
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
};
