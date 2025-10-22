import { z } from "zod";

export const subTaskSchema = z.object({
  id: z.string().nullable(),
  contentType: z.enum(["image", "video", "audio", "text"]),
  videoUrl: z.string().min(1, "Video URL is required"),
  textContent: z.string().min(1, "Text content is required"),
  musicUrl: z.string().min(1, "Music URL is required"),
  imageFile: z.instanceof(File).nullable(),
  imageKey: z.string().nullable(),
  imagePreview: z.string().nullable(),
  isUploading: z.boolean(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
});
