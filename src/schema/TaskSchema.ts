import { z } from "zod";

export const taskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    videoUrl: z
      .union([z.literal(""), z.url("Please enter a valid YouTube URL")])
      .optional(),
    textContent: z.string().optional(),
    musicUrl: z
      .union([z.literal(""), z.url("Please enter a valid music platform URL")])
      .optional(),
  });
  