import axiosInstance from "@/config/axios-config";
import { enrichDashboardRows } from "./enrichDashboardRows";
import {
  normalizeStatus,
  parseDashboardLanguages,
  pickSeriesTitle,
  type DashboardTableRow,
} from "./dashboardTable";

/** Series rows omit `title` in JSON; titles live in `metadata`. */
export function displayDashboardItemTitle(item: DashboardApiItem): string {
  if (item.type === "plan") {
    return item.title?.trim() || "Untitled plan";
  }
  const fromMeta = pickSeriesTitle(undefined, item.metadata);
  return fromMeta === "Untitled" ? "Untitled series" : fromMeta;
}

function mapDashboardItemToTableRow(item: DashboardApiItem): DashboardTableRow {
  return {
    kind: item.type,
    id: String(item.id),
    title: displayDashboardItemTitle(item),
    image_url: item.image_url ?? "",
    languages: parseDashboardLanguages(item.languages),
    status: normalizeStatus(item.status),
    total_days: item.total_days ?? 0,
    enrolled: item.enrolled_count ?? 0,
    modifiedAt: item.updated_at ?? item.created_at ?? null,
    featured: !!item.featured,
    group_id: item.group_id ?? null,
    series_id: item.series_id ?? null,
    ...(item.type === "series" && {
      plans_count: item.plans_count ?? 0,
    }),
  };
}

export type DashboardTab = "all" | "plans" | "series";

export interface DashboardSeriesMetadataDTO {
  id: string;
  title: string;
  description?: string;
  language: string;
}

export interface DashboardApiItem {
  id: string;
  type: "plan" | "series";
  /** Plans only; omitted from JSON for series. */
  title?: string;
  metadata?: DashboardSeriesMetadataDTO[];
  author_id?: string;
  group_id?: string | null;
  series_id?: string | null;
  image_url?: string | null;
  image_key?: string | null;
  status: string;
  featured: boolean;
  languages: string[];
  enrolled_count: number;
  plans_count?: number | null;
  total_days?: number | null;
  updated_at?: string | null;
  created_at: string;
}

export interface DashboardPagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface DashboardItemsResponse {
  items: DashboardApiItem[];
  pagination: DashboardPagination;
}

export interface FetchDashboardItemsParams {
  tab: DashboardTab;
  page: number;
  pageSize?: number;
  search?: string;
  status?: string;
  language?: string;
  featured?: boolean;
  group_id?: string;
}

export interface DashboardItemsResult {
  rows: DashboardTableRow[];
  pagination: DashboardPagination;
}

const DASHBOARD_ITEMS_PATH = "/api/v1/cms/dashboard/items";

export const DASHBOARD_PAGE_SIZE = 10;

export async function fetchDashboardItems(
  params: FetchDashboardItemsParams,
): Promise<DashboardItemsResult> {
  const pageSize = params.pageSize ?? DASHBOARD_PAGE_SIZE;

  const { data } = await axiosInstance.get<DashboardItemsResponse>(
    DASHBOARD_ITEMS_PATH,
    {
      params: {
        tab: params.tab,
        page: params.page,
        page_size: pageSize,
        ...(params.search?.trim() && { search: params.search.trim() }),
        ...(params.status && { status: params.status }),
        ...(params.language && { language: params.language }),
        ...(params.featured != null && { featured: params.featured }),
        ...(params.group_id && { group_id: params.group_id }),
      },
    },
  );

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? {
    page: params.page,
    page_size: pageSize,
    total: items.length,
    total_pages: items.length > 0 ? 1 : 0,
  };

  const rows = await enrichDashboardRows(items.map(mapDashboardItemToTableRow));

  return {
    rows,
    pagination,
  };
}
