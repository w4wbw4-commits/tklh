// Lightweight profanity filter for AR + EN.
// Not exhaustive — caught items can be expanded without code changes.
// We normalize Arabic letters to handle common variants.

const AR_BAD = [
  "كس", "زب", "طيز", "خرا", "خراء", "شرموطة", "شرموط", "قحبة", "قحاب",
  "منيك", "منيوك", "معرص", "معرصين", "العاهرة", "عاهرة", "كلب ابن",
  "ابن كلب", "بنت كلب", "حمار", "غبي", "احمق", "أحمق",
];

const EN_BAD = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "pussy",
  "cunt", "slut", "whore", "fag", "nigger", "retard", "idiot", "stupid",
];

// Normalize Arabic: remove tatweel, normalize alif/ya/taa marbuta, strip diacritics.
const normalizeAr = (s: string) =>
  s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // diacritics + tatweel
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase();

const escapeRe = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildRegex = (words: string[], arabic: boolean) => {
  const parts = words.map((w) => escapeRe(arabic ? normalizeAr(w) : w.toLowerCase()));
  // word-ish boundary: surrounded by start/end or non-letter
  return new RegExp(`(^|[^\\p{L}])(${parts.join("|")})($|[^\\p{L}])`, "giu");
};

const RE_AR = buildRegex(AR_BAD, true);
const RE_EN = buildRegex(EN_BAD, false);

export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  const ar = normalizeAr(text);
  const en = text.toLowerCase();
  RE_AR.lastIndex = 0;
  RE_EN.lastIndex = 0;
  return RE_AR.test(ar) || RE_EN.test(en);
};

export const maskProfanity = (text: string): string => {
  if (!text) return text;
  const replacer = (_m: string, pre: string, word: string, post: string) =>
    `${pre}${"*".repeat(word.length)}${post}`;
  // Mask English directly on original casing
  let out = text.replace(RE_EN, replacer);
  // For Arabic, mask on original by mapping normalized hits back.
  // Simple approach: mask every original Arabic word whose normalization matches.
  out = out.replace(/\p{L}+/gu, (token) => {
    const norm = normalizeAr(token);
    RE_AR.lastIndex = 0;
    if (new RegExp(`(^|[^\\p{L}])(${AR_BAD.map((w) => escapeRe(normalizeAr(w))).join("|")})($|[^\\p{L}])`, "u")
      .test(` ${norm} `)) {
      return "*".repeat(token.length);
    }
    return token;
  });
  return out;
};
