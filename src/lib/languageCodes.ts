import { PLAN_LANGUAGE } from "@/lib/constant";
import type { LanguageCode } from "@/schema/SeriesSchema";

export const LANGUAGE_CODE_ORDER = PLAN_LANGUAGE.map(
  (l) => l.value,
) as LanguageCode[];

const LANGUAGE_CODE_SET = new Set<string>(
  LANGUAGE_CODE_ORDER.map((code) => code.toUpperCase()),
);

export function normalizeLanguageCode(raw: string): LanguageCode | null {
  const code = raw.trim().toUpperCase();
  return LANGUAGE_CODE_SET.has(code) ? (code as LanguageCode) : null;
}
