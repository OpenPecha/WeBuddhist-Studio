import { normalizeLanguageCode } from "@/lib/languageCodes";
import type { LanguageCode } from "@/schema/SeriesSchema";

const DEFAULT_LANGUAGE: LanguageCode = "EN";

export function parseSeriesLanguageParam(
  searchParams: URLSearchParams,
): LanguageCode {
  return (
    normalizeLanguageCode(searchParams.get("language") ?? "") ??
    DEFAULT_LANGUAGE
  );
}

export function buildSeriesLanguageParams(
  searchParams: URLSearchParams,
  language: LanguageCode,
): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  if (language === DEFAULT_LANGUAGE) {
    next.delete("language");
  } else {
    next.set("language", language);
  }
  return next;
}
