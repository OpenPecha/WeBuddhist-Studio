import { z } from "zod";
import { PLAN_LANGUAGE } from "@/lib/constant";

const LANGUAGE_CODES = PLAN_LANGUAGE.map((l) => l.value) as ["EN", "BO", "ZH"];
export type GroupLanguageCode = (typeof LANGUAGE_CODES)[number];

export const groupLanguageBlockSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim(),
});

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
    is_public: z.boolean(),
    languages: z.object({
      EN: groupLanguageBlockSchema.optional(),
      BO: groupLanguageBlockSchema.optional(),
      ZH: groupLanguageBlockSchema.optional(),
    }),
    avatar_key: z.string().optional(),
    banner_key: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const present = LANGUAGE_CODES.filter((c) => data.languages[c] != null);
    if (present.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one language with a title",
        path: ["languages"],
      });
    }
    for (const code of present) {
      const block = data.languages[code];
      if (!block?.title?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Title is required",
          path: ["languages", code, "title"],
        });
      }
    }
  });

export type GroupCoreFormData = z.infer<typeof groupCoreSchema>;

export const groupSocialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url("Enter a valid URL"),
});

export type GroupSocialLinkFormData = z.infer<typeof groupSocialLinkSchema>;
