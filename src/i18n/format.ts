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
