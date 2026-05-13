import { z } from "zod";
import { PLAN_LANGUAGE } from "@/lib/constant";

const LANGUAGE_CODES = PLAN_LANGUAGE.map((l) => l.value) as ["EN", "BO", "ZH"];
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const languageBlockSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim(),
});

export const planItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  image_url: z.string().optional(),
});

export type SeriesPlan = z.infer<typeof planItemSchema>;

export const seriesSchema = z.object({
  languages: z.object({
    EN: languageBlockSchema.optional(),
    BO: languageBlockSchema.optional(),
    ZH: languageBlockSchema.optional(),
  }),
  plans: z.object({
    EN: z.array(planItemSchema).optional(),
    BO: z.array(planItemSchema).optional(),
    ZH: z.array(planItemSchema).optional(),
  }),
  image_url: z.string(),
});

export type SeriesFormData = z.infer<typeof seriesSchema>;
