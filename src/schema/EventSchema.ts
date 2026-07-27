import { z } from "zod";
import type { LanguageCode } from "@/lib/languageCodes";

export type { LanguageCode };

export const eventMetadataRowSchema = z.object({
  language: z.string().trim().min(1, "Language is required"),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim(),
});

export type EventMetadataRow = z.infer<typeof eventMetadataRowSchema>;

export const eventLinkRowSchema = z.object({
  type: z
    .string()
    .trim()
    .min(1, "Type is required")
    .max(50, "Type must be at most 50 characters"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2000, "URL must be at most 2000 characters")
    .refine(
      (value) => /^https?:\/\/.+/i.test(value),
      "URL must start with http:// or https://",
    ),
  label: z.string().trim().max(255, "Label must be at most 255 characters"),
});

export type EventLinkRow = z.infer<typeof eventLinkRowSchema>;

export const eventSchema = z
  .object({
    start_date: z.string().trim().min(1, "Start date is required"),
    end_date: z.string().trim().min(1, "End date is required"),
    is_one_day: z.boolean(),
    metadata: z
      .array(eventMetadataRowSchema)
      .min(1, "Add at least one language"),
    links: z.array(eventLinkRowSchema),
    image_url: z.string().trim(),
    plan_id: z.string().trim(),
    series_id: z.string().trim(),
    accumulator_id: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date && data.end_date < data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be on or after the start date",
        path: ["end_date"],
      });
    }

    const seen = new Set<string>();
    data.metadata.forEach((row, index) => {
      if (seen.has(row.language)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Each language can only be added once",
          path: ["metadata", index, "language"],
        });
      }
      seen.add(row.language);
    });
  });

export type EventFormData = z.infer<typeof eventSchema>;

export const emptyMetadataRow = (language: LanguageCode): EventMetadataRow => ({
  language,
  name: "",
  description: "",
});

export const emptyLinkRow = (): EventLinkRow => ({
  type: "",
  url: "",
  label: "",
});

export const defaultEventFormValues = (): EventFormData => ({
  start_date: "",
  end_date: "",
  is_one_day: false,
  metadata: [emptyMetadataRow("EN")],
  links: [],
  image_url: "",
  plan_id: "",
  series_id: "",
  accumulator_id: "",
});
