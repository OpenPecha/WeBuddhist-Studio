import { z } from "zod";
import type { LanguageCode } from "@/lib/languageCodes";

export type { LanguageCode };

export const RecurrenceFrequency = {
  YEARLY: "YEARLY",
  MONTHLY: "MONTHLY",
} as const;

export type RecurrenceFrequency =
  (typeof RecurrenceFrequency)[keyof typeof RecurrenceFrequency];

export const RecurrenceDateSystem = {
  GREGORIAN: "GREGORIAN",
  TIBETAN_LUNAR: "TIBETAN_LUNAR",
} as const;

export type RecurrenceDateSystem =
  (typeof RecurrenceDateSystem)[keyof typeof RecurrenceDateSystem];

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

export const recurrenceSchema = z
  .object({
    frequency: z.enum(["YEARLY", "MONTHLY"]),
    date_system: z.enum(["GREGORIAN", "TIBETAN_LUNAR"]),
    calendar_type: z.string().trim().max(10),
    month: z.number().int().min(1).max(12).nullable(),
    day: z.number().int().min(1).max(31),
    duration_days: z.number().int().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.date_system === "TIBETAN_LUNAR") {
      if (!data.calendar_type || data.calendar_type.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Calendar type is required for Tibetan Lunar",
          path: ["calendar_type"],
        });
      } else if (!["phugpa", "tsurphu"].includes(data.calendar_type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Calendar type must be 'phugpa' or 'tsurphu'",
          path: ["calendar_type"],
        });
      }
      if (data.day > 30) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lunar day must be between 1 and 30",
          path: ["day"],
        });
      }
    }

    if (data.frequency === "YEARLY") {
      if (data.month === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Month is required for yearly recurrence",
          path: ["month"],
        });
      }
    }
  });

export type RecurrenceFormData = z.infer<typeof recurrenceSchema>;

export const eventSchema = z
  .object({
    is_recurring: z.boolean(),
    start_date: z.string().trim(),
    end_date: z.string().trim(),
    is_one_day: z.boolean(),
    recurrence: recurrenceSchema.nullable(),
    metadata: z
      .array(eventMetadataRowSchema)
      .min(1, "Add at least one language"),
    links: z.array(eventLinkRowSchema),
    image_url: z.string().trim(),
    plan_id: z.string().trim(),
    series_id: z.string().trim(),
    accumulator_id: z.string().trim(),
    group_recitation_collection_id: z.string().trim(),
    location_id: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    // Either dates or recurrence required
    if (!data.is_recurring) {
      if (!data.start_date || data.start_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start date is required",
          path: ["start_date"],
        });
      }
      if (!data.end_date || data.end_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date is required",
          path: ["end_date"],
        });
      }
      if (data.start_date && data.end_date && data.end_date < data.start_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be on or after the start date",
          path: ["end_date"],
        });
      }
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

export const emptyRecurrence = (): RecurrenceFormData => ({
  frequency: "YEARLY",
  date_system: "GREGORIAN",
  calendar_type: "",
  month: 1,
  day: 1,
  duration_days: 1,
});

export const defaultEventFormValues = (): EventFormData => ({
  is_recurring: false,
  start_date: "",
  end_date: "",
  is_one_day: false,
  recurrence: null,
  metadata: [emptyMetadataRow("EN")],
  links: [],
  image_url: "",
  plan_id: "",
  series_id: "",
  accumulator_id: "",
  group_recitation_collection_id: "",
  location_id: "",
});
