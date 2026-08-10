import { z } from "zod";

export const locationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters"),
    latitude: z.string().trim(),
    longitude: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    const hasLat = data.latitude !== "";
    const hasLng = data.longitude !== "";

    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Set both latitude and longitude, or leave both empty",
        path: [hasLat ? "longitude" : "latitude"],
      });
      return;
    }

    if (!hasLat) return;

    const lat = Number(data.latitude);
    const lng = Number(data.longitude);

    if (!Number.isFinite(lat)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latitude must be a number",
        path: ["latitude"],
      });
    } else if (lat < -90 || lat > 90) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latitude must be between -90 and 90",
        path: ["latitude"],
      });
    }

    if (!Number.isFinite(lng)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Longitude must be a number",
        path: ["longitude"],
      });
    } else if (lng < -180 || lng > 180) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Longitude must be between -180 and 180",
        path: ["longitude"],
      });
    }
  });

export type LocationFormData = z.infer<typeof locationSchema>;

export const defaultLocationFormValues = (): LocationFormData => ({
  name: "",
  latitude: "",
  longitude: "",
});

export function parseCoordinates(data: LocationFormData): {
  latitude: number | null;
  longitude: number | null;
} {
  if (data.latitude === "" || data.longitude === "") {
    return { latitude: null, longitude: null };
  }
  return { latitude: Number(data.latitude), longitude: Number(data.longitude) };
}

export function coordinateToInput(value: number | undefined | null): string {
  return value == null ? "" : String(value);
}
