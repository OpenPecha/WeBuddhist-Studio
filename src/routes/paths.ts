export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  dashboard: "/dashboard",
  planNew: "/plan/new",
  plan: (planId: string) => `/plan/${planId}`,
  planEdit: (planId: string) => `/plan/${planId}/edit`,
  seriesNew: "/series/new",
  series: (seriesId: string) => `/series/${seriesId}`,
  seriesEdit: (seriesId: string) => `/series/${seriesId}/edit`,
  analytics: "/analytics",
  profile: "/profile",
  tags: "/tags",
} as const;

export const AUTH_ROUTE_PATHS: readonly string[] = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.verifyEmail,
];
