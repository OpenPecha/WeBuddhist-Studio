import type { LanguageCode } from "@/schema/SeriesSchema";

export type SeriesPlanRow = {
  id: string;
  title: string;
  image_url: string;
  language: LanguageCode;
  status: string;
  total_days: number;
  enrolled: number;
  modifiedAt: string | null;
  featured: boolean;
};

export type PlansByLanguage = Partial<Record<LanguageCode, SeriesPlanRow[]>>;
