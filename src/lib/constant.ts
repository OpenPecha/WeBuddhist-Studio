export const SITE_NAME = "Plan Studio";
export const ACCESS_TOKEN = "accessToken";
export const RESET_PASSWORD = "resetPassword";
export const RESET_PASSWORD_TOKEN = "resetPasswordToken";
export const REFRESH_TOKEN = "refreshToken";
export const BACKEND_BASE_URL = import.meta.env.PROD ? "" : (import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8000");
export const LANGUAGE = "language";
export const DIFFICULTY = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
  { label: "Expert", value: "expert" },
];
