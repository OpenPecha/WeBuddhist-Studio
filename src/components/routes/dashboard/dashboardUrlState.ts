import type { DashboardTab } from "./dashboardApi";
import { DASHBOARD_PAGE_SIZE } from "./dashboardApi";
import type { FetchDashboardItemsParams } from "./dashboardApi";

export type DashboardPlanStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "ARCHIVED"
  | "DELETED";

/** UI-only until backend supports dashboard sort query params. */
export type DashboardSort = "recent";

export interface DashboardUrlState {
  tab: DashboardTab;
  page: number;
  pageSize: number;
  search: string | null;
  status: DashboardPlanStatus | null;
  language: string | null;
  featured: boolean | null;
  sort: DashboardSort | null;
}

export const DASHBOARD_URL_DEFAULTS: DashboardUrlState = {
  tab: "all",
  page: 1,
  pageSize: DASHBOARD_PAGE_SIZE,
  search: null,
  status: null,
  language: null,
  featured: null,
  sort: null,
};

const VALID_TABS = new Set<DashboardTab>(["all", "series", "plans"]);

const VALID_STATUS = new Set<DashboardPlanStatus>([
  "DRAFT",
  "PUBLISHED",
  "UNPUBLISHED",
  "ARCHIVED",
  "DELETED",
]);

const VALID_LANGUAGE = new Set(["EN", "BO", "ZH"]);

const VALID_SORT = new Set<DashboardSort>(["recent"]);

function parseTab(raw: string | null): DashboardTab {
  if (raw && VALID_TABS.has(raw as DashboardTab)) {
    return raw as DashboardTab;
  }
  return DASHBOARD_URL_DEFAULTS.tab;
}

function parseStatus(raw: string | null): DashboardPlanStatus | null {
  if (!raw) return null;
  const u = raw.trim().toUpperCase();
  return VALID_STATUS.has(u as DashboardPlanStatus)
    ? (u as DashboardPlanStatus)
    : null;
}

function parseLanguage(raw: string | null): string | null {
  if (!raw) return null;
  const u = raw.trim().toUpperCase();
  return VALID_LANGUAGE.has(u) ? u : null;
}

function parseSort(raw: string | null): DashboardSort | null {
  if (!raw) return null;
  return VALID_SORT.has(raw as DashboardSort) ? (raw as DashboardSort) : null;
}

function parsePositiveInt(
  raw: string | null,
  fallback: number,
  min: number,
  max?: number,
): number {
  const n = Number(raw ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  const clamped = Math.max(min, Math.floor(n));
  if (max != null) return Math.min(max, clamped);
  return clamped;
}

export function parseDashboardSearchParams(
  params: URLSearchParams,
): DashboardUrlState {
  const featuredRaw = params.get("featured");
  const featured =
    featuredRaw === "true" ? true : featuredRaw === "false" ? false : null;

  const search = params.get("search")?.trim() || null;

  return {
    tab: parseTab(params.get("tab")),
    page: parsePositiveInt(params.get("page"), DASHBOARD_URL_DEFAULTS.page, 1),
    pageSize: parsePositiveInt(
      params.get("page_size"),
      DASHBOARD_URL_DEFAULTS.pageSize,
      1,
      100,
    ),
    search,
    status: parseStatus(params.get("status")),
    language: parseLanguage(params.get("language")),
    featured,
    sort: parseSort(params.get("sort")),
  };
}

export function buildDashboardSearchParams(
  state: DashboardUrlState,
): URLSearchParams {
  const p = new URLSearchParams();
  const d = DASHBOARD_URL_DEFAULTS;

  if (state.tab !== d.tab) p.set("tab", state.tab);
  if (state.page !== d.page) p.set("page", String(state.page));
  if (state.pageSize !== d.pageSize) p.set("page_size", String(state.pageSize));
  if (state.search) p.set("search", state.search);
  if (state.status) p.set("status", state.status);
  if (state.language) p.set("language", state.language);
  if (state.featured !== null) p.set("featured", String(state.featured));
  if (state.sort) p.set("sort", state.sort);

  return p;
}

export function dashboardUrlStateToFetchParams(
  state: DashboardUrlState,
): FetchDashboardItemsParams {
  return {
    tab: state.tab,
    page: state.page,
    pageSize: state.pageSize,
    ...(state.search && { search: state.search }),
    ...(state.status && { status: state.status }),
    ...(state.language && { language: state.language }),
    ...(state.featured != null && { featured: state.featured }),
  };
}

/** Merge partial state; pass `page: 1` when filters change. */
export function mergeDashboardUrlState(
  current: DashboardUrlState,
  patch: Partial<DashboardUrlState>,
): DashboardUrlState {
  return { ...current, ...patch };
}
