/** Uppercase language code used across Studio (e.g. "EN", "BO", "LA"). */
export type LanguageCode = string;

/**
 * Preferred display / iteration order when API order is unavailable.
 * Falls back to alphabetical when a code is not listed.
 */
export const LANGUAGE_CODE_ORDER: LanguageCode[] = [
  "EN",
  "BO",
  "ZH",
  "HI",
  "NE",
  "MN",
  "LA",
];

export function normalizeLanguageCode(raw: string): LanguageCode | null {
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{2,8}$/.test(code)) return null;
  return code;
}

export function sortLanguageCodes(codes: LanguageCode[]): LanguageCode[] {
  return [...codes].sort((a, b) => {
    const ai = LANGUAGE_CODE_ORDER.indexOf(a);
    const bi = LANGUAGE_CODE_ORDER.indexOf(b);
    const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.localeCompare(b);
  });
}
