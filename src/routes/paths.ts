export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  dashboard: "/dashboard",
  /** @deprecated use groupPlanNew */
  planNew: "/plan/new",
  plan: (planId: string) => `/plan/${planId}`,
  planEdit: (planId: string) => `/plan/${planId}/edit`,
  /** @deprecated use groupSeriesNew */
  seriesNew: "/series/new",
  series: (seriesId: string) => `/series/${seriesId}`,
  seriesEdit: (seriesId: string) => `/series/${seriesId}/edit`,
  analytics: "/analytics",
  profile: "/profile",
  tags: "/tags",
  verseOfDay: "/verse-of-day",
  groups: "/groups",
  groupNew: "/groups/new",
  group: (groupId: string) => `/groups/${groupId}`,
  groupContent: (groupId: string) => `/groups/${groupId}/content`,
  groupTransfers: (groupId: string) => `/groups/${groupId}/transfers`,
  groupMembers: (groupId: string) => `/groups/${groupId}/members`,
  groupEvents: (groupId: string) => `/groups/${groupId}/events`,
  groupEventNew: (groupId: string) => `/groups/${groupId}/events/new`,
  groupEvent: (groupId: string, eventId: string) =>
    `/groups/${groupId}/events/${eventId}`,
  groupEventEdit: (groupId: string, eventId: string) =>
    `/groups/${groupId}/events/${eventId}/edit`,
  groupChants: (groupId: string) => `/groups/${groupId}/chants`,
  groupChantNew: (groupId: string) => `/groups/${groupId}/chants/new`,
  groupChant: (groupId: string, collectionId: string) =>
    `/groups/${groupId}/chants/${collectionId}`,
  groupChantEdit: (groupId: string, collectionId: string) =>
    `/groups/${groupId}/chants/${collectionId}/edit`,
  groupLocations: (groupId: string) => `/groups/${groupId}/locations`,
  groupEdit: (groupId: string) => `/groups/${groupId}/edit`,
  groupPlanNew: (groupId: string) => `/groups/${groupId}/plan/new`,
  groupSeriesNew: (groupId: string) => `/groups/${groupId}/series/new`,
  adminAuthors: "/admin/authors",
  adminChinaRestrictions: "/admin/china-restrictions",
  accumulatorPresets: "/accumulator-presets",
} as const;

export const AUTH_ROUTE_PATHS: readonly string[] = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.verifyEmail,
];
