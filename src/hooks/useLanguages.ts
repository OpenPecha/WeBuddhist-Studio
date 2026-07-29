import { useQuery } from "@tanstack/react-query";
import {
  fetchLanguages,
  getLanguageLabel,
  getLanguageName,
  getLanguageOptions,
  LANGUAGES_QUERY_KEY,
  type StudioLanguageOption,
} from "@/components/api/languagesApi";

export type { StudioLanguageOption };

/** Shared languages query — all consumers dedupe via `LANGUAGES_QUERY_KEY`. */
export function useLanguages(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: LANGUAGES_QUERY_KEY,
    queryFn: () => fetchLanguages(true),
    enabled: options?.enabled ?? true,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const languageOptions = query.data ?? getLanguageOptions();

  return {
    ...query,
    languageOptions,
    getLanguageLabel,
    getLanguageName,
  };
}
