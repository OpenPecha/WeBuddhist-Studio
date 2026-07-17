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
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const eventMetadataRowSchema = z.object({
  language: z.enum(LANGUAGE_CODES),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim(),
});

export type EventMetadataRow = z.infer<typeof eventMetadataRowSchema>;

export const eventSchema = z
  .object({
    start_date: z.string().trim().min(1, "Start date is required"),
    end_date: z.string().trim().min(1, "End date is required"),
    is_one_day: z.boolean(),
    metadata: z
      .array(eventMetadataRowSchema)
      .min(1, "Add at least one language"),
    image_url: z.string().trim(),
    // Linked content — each is a single id chosen via a search picker.
    plan_id: z.string().trim(),
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

export const defaultEventFormValues = (): EventFormData => ({
  start_date: "",
  end_date: "",
  is_one_day: false,
  metadata: [emptyMetadataRow("EN")],
  image_url: "",
  plan_id: "",
  accumulator_id: "",
});
