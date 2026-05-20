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
  analytics: "/analytics",
  profile: "/profile",
} as const;

export const AUTH_ROUTE_PATHS: readonly string[] = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.verifyEmail,
];
