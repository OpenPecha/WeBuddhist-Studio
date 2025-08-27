import { z } from "zod";

export const signupSchema = z.object({
    email: z.string().min(1, "Email is required").refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
      message: "Please enter a valid email address"
    }),
    firstname: z.string().min(1, "First name is required").min(2, "First name must be at least 2 characters"),
    lastname: z.string().min(1, "Last name is required").min(2, "Last name must be at least 2 characters"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });