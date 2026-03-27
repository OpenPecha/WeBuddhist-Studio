import axiosInstance from "@/config/axios-config";
import { LANGUAGE } from "@/lib/constant";

type SearchCommon = {
  query: string;
  language?: string;
  limit?: number;
  skip?: number;
};

const normalizeLanguageForApi = (language?: string | null) => {
  if (!language) return "en";
  const lower = language.toLowerCase();
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("bo")) return "bo";
  if (lower.startsWith("zh")) return "zh";
  return "en";
};

const pickSearchLanguage = (query: string, uiLanguage?: string | null) => {
  const normalized = normalizeLanguageForApi(uiLanguage);
  if (/[A-Za-z]/.test(query) && normalized !== "en") {
    return "en";
  }
  return normalized;
};

export const searchSources = async ({
  query,
  limit = 10,
  skip = 0,
}: SearchCommon) => {
  const { data } = await axiosInstance.get(`/api/v1/search/multilingual`, {
    params: {
      query,
      search_type: "exact",
      limit,
      skip,
    },
  });
  return data;
};

export type { SearchCommon };
