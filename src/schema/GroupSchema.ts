import { z } from "zod";
import { PLAN_LANGUAGE } from "@/lib/constant";

const LANGUAGE_CODES = PLAN_LANGUAGE.map((l) => l.value) as [
  "EN",
  "BO",
  "ZH",
  "HI",
  "NE",
  "MN",
];
export type GroupLanguageCode = (typeof LANGUAGE_CODES)[number];

export const groupLanguageBlockSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  sub_title: z.string().trim().min(1, "Sub-title is required"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(200, "Description must be 200 characters or less"),
  description_long: z.string().trim().optional(),
});

export const authorGroupTypeSchema = z.enum(["PAGE", "COMMUNITY"]);

export type AuthorGroupType = z.infer<typeof authorGroupTypeSchema>;

export const groupCoreSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and hyphens only",
      ),
    group_type: authorGroupTypeSchema,
    is_public: z.boolean(),
    languages: z.object({
      EN: groupLanguageBlockSchema.optional(),
      BO: groupLanguageBlockSchema.optional(),
      ZH: groupLanguageBlockSchema.optional(),
      HI: groupLanguageBlockSchema.optional(),
      NE: groupLanguageBlockSchema.optional(),
      MN: groupLanguageBlockSchema.optional(),
    }),
    avatar_key: z.string().optional(),
    banner_key: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const present = LANGUAGE_CODES.filter((c) => data.languages[c] != null);
    if (present.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one language",
        path: ["languages"],
      });
    }
  });

export type GroupCoreFormData = z.infer<typeof groupCoreSchema>;

export const groupSocialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url("Enter a valid URL"),
});

export type GroupSocialLinkFormData = z.infer<typeof groupSocialLinkSchema>;
