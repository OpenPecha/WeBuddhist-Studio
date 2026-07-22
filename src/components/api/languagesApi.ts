import axiosInstance from "@/config/axios-config";

export type LanguageDTO = {
  code: string;
  name: string;
  native_name: string;
  enabled: boolean;
};

export type LanguageListResponse = {
  languages: LanguageDTO[];
};

/** Select option used across Studio language pickers. */
export type StudioLanguageOption = {
  value: string;
  label: string;
  name: string;
  enabled: boolean;
};

export const LANGUAGES_QUERY_KEY = ["languages"] as const;

let cachedLanguageOptions: StudioLanguageOption[] = [];

export function rememberLanguageOptions(options: StudioLanguageOption[]) {
  cachedLanguageOptions = options;
}

export function getLanguageOptions(): StudioLanguageOption[] {
  return cachedLanguageOptions;
}

export function getLanguageLabel(code: string): string {
  const upper = code.trim().toUpperCase();
  return (
    cachedLanguageOptions.find((l) => l.value === upper)?.label ?? upper
  );
}

export function getLanguageName(code: string): string {
  const upper = code.trim().toUpperCase();
  return cachedLanguageOptions.find((l) => l.value === upper)?.name ?? upper;
}

export function toStudioLanguageOption(
  language: LanguageDTO,
): StudioLanguageOption {
  return {
    value: language.code.trim().toUpperCase(),
    label: language.native_name || language.name,
    name: language.name,
    enabled: language.enabled,
  };
}

export async function fetchLanguages(
  enabledOnly = true,
): Promise<StudioLanguageOption[]> {
  const { data } = await axiosInstance.get<LanguageListResponse>(
    `/api/v1/languages`,
    { params: { enabled_only: enabledOnly } },
  );
  const options = (data.languages ?? []).map(toStudioLanguageOption);
  rememberLanguageOptions(options);
  return options;
}
