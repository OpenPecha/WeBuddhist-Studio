import type { LanguageCode } from "@/lib/languageCodes";
import {
  getLanguageLabel,
  getLanguageName,
} from "@/components/api/languagesApi";

/** English name used for form field labels (e.g. "English title"). */
export const getEnglishLanguageLabel = (code: LanguageCode): string =>
  getLanguageName(code);

/** Native label used for plan tabs and chips. */
export const getNativeLanguageLabel = (code: LanguageCode): string =>
  getLanguageLabel(code);
