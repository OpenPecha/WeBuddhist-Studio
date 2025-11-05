import { z } from "zod";

export const planSchema = z.object({
  title: z.string().min(1, "Plan title is required"),
  description: z.string().min(1, "Description is required"),
  total_days: z.string().min(1, "Number of days is required"),
  difficulty_level: z.string().min(1, "Difficulty is required"),
  image_url: z.string().min(1, "Cover image is required"),
  tags: z.array(z.string()),
  language: z.string().min(1, "Language is required"),
});
