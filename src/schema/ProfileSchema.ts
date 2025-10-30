import { z } from "zod";

export const profileSchema = z.object({
  firstname: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastname: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  bio: z.string().optional(),
  image_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export const socialProfileSchema = z.object({
  account: z.string().min(1, "Social platform is required"),
  url: z.string().url("Please enter a valid URL").min(1, "URL is required"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type SocialProfileData = z.infer<typeof socialProfileSchema>;
