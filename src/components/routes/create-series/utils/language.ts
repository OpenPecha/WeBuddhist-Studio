import { PLAN_LANGUAGE } from "@/lib/constant";
import type { LanguageCode } from "@/schema/SeriesSchema";

const ENGLISH_LABELS: Record<LanguageCode, string> = {
  EN: "English",
  BO: "Tibetan",
  ZH: "Chinese",
};

/** English label used for form field labels (e.g. "English title"). */
export const getEnglishLanguageLabel = (code: LanguageCode): string =>
  ENGLISH_LABELS[code] ?? code;

/** Native label from PLAN_LANGUAGE used for plan tabs. */
export const getNativeLanguageLabel = (code: LanguageCode): string =>
  PLAN_LANGUAGE.find((l) => l.value === code)?.label ?? code;
