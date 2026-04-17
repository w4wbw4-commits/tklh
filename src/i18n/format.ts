// Number/date formatting helpers — both locales use Latin digits per user pref
import i18n from "./index";

export const fmtNumber = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

export const fmtDate = (
  d: string | number | Date,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
) => {
  const date = d instanceof Date ? d : new Date(d);
  // Use Arabic month names with Latin digits in AR mode
  const locale = i18n.language === "ar" ? "ar-SA-u-nu-latn" : "en-US";
  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const fmtDateTime = (d: string | number | Date) =>
  fmtDate(d, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

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
  const locale = i18n.language === "ar" ? "ar-SA-u-nu-latn" : "en-US";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, sec] of RTF_UNITS) {
    if (Math.abs(diffSec) >= sec || unit === "second") {
      return rtf.format(Math.round(diffSec / sec), unit);
    }
  }
  return fmtDate(date);
};
