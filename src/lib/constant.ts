export const SITE_NAME = "Plan Studio";
export const ACCESS_TOKEN = "accessToken";
export const RESET_PASSWORD = "resetPassword";
export const RESET_PASSWORD_TOKEN = "resetPasswordToken";
export const REFRESH_TOKEN = "refreshToken";
export const NO_PROFILE_IMAGE =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
export const LANGUAGE = "language";
export const DIFFICULTY = [
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
];

export const STATUS_TRANSITIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Publish", value: "PUBLISHED" },
  { label: "Unpublish", value: "UNPUBLISHED" },
  { label: "Archive", value: "ARCHIVED" },
];

export const ALLOWED_TRANSITIONS = {
  DRAFT: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["UNPUBLISHED"],
  UNPUBLISHED: ["PUBLISHED", "DRAFT", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};
