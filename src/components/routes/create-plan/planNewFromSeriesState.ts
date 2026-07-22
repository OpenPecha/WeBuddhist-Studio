import { normalizeLanguageCode } from "@/lib/languageCodes";
import type { LanguageCode } from "@/schema/SeriesSchema";

export type PlanNewFromSeriesState = {
  seriesId: string;
  language: LanguageCode;
  /** Inherited from the first plan in the series when other plans already exist. */
  start_date?: string | null;
};

export function parsePlanNewFromSeriesState(
  state: unknown,
): PlanNewFromSeriesState | null {
  if (!state || typeof state !== "object") return null;

  const { seriesId, language } = state as Record<string, unknown>;
  if (typeof seriesId !== "string" || !seriesId.trim()) return null;
  if (typeof language !== "string") return null;
  const normalized = normalizeLanguageCode(language);
  if (!normalized) return null;

  const rawStartDate = (state as Record<string, unknown>).start_date;
  const start_date =
    rawStartDate === null
      ? null
      : typeof rawStartDate === "string"
        ? rawStartDate
        : undefined;

  return {
    seriesId: seriesId.trim(),
    language: normalized,
    ...(start_date !== undefined ? { start_date } : {}),
  };
}
