import { PLAN_LANGUAGE } from "@/lib/constant";
import type { LanguageCode } from "@/schema/SeriesSchema";

export type PlanNewFromSeriesState = {
  seriesId: string;
  language: LanguageCode;
  /** Inherited from the first plan in the series when other plans already exist. */
  start_date?: string | null;
};

const VALID_LANGUAGE_CODES = new Set(
  PLAN_LANGUAGE.map((l) => l.value as LanguageCode),
);

export function parsePlanNewFromSeriesState(
  state: unknown,
): PlanNewFromSeriesState | null {
  if (!state || typeof state !== "object") return null;

  const { seriesId, language } = state as Record<string, unknown>;
  if (typeof seriesId !== "string" || !seriesId.trim()) return null;
  if (
    typeof language !== "string" ||
    !VALID_LANGUAGE_CODES.has(language as LanguageCode)
  ) {
    return null;
  }

  const rawStartDate = (state as Record<string, unknown>).start_date;
  const start_date =
    rawStartDate === null
      ? null
      : typeof rawStartDate === "string"
        ? rawStartDate
        : undefined;

  return {
    seriesId: seriesId.trim(),
    language: language as LanguageCode,
    ...(start_date !== undefined ? { start_date } : {}),
  };
}
