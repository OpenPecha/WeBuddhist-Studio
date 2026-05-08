import { z } from "zod";

export const seriesSchema = z.object({
  title: z.string().min(1, "Series title is required"),
  description: z.string().min(1, "Description is required"),
  image_url: z.string().min(1, "Cover image is required"),
  language: z.string().min(1, "Language is required"),
  plan_ids: z.array(z.string()),
});