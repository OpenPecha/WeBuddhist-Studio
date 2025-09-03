import { z } from "zod";

export const planSchema = z.object({
  planTitle: z.string().min(1, "Plan title is required"),
  description: z.string().min(1, "Description is required"),
  numberOfDays: z.string().min(1, "Number of days is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  coverImage: z.string().optional(),
  tags: z.array(z.string()),
});
