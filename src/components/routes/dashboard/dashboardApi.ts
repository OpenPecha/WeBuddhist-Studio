import axiosInstance from "@/config/axios-config";
import {
  normalizeStatus,
  parseDashboardLanguages,
  type DashboardTableRow,
} from "./dashboardTable";

function mapDashboardItemToTableRow(item: DashboardApiItem): DashboardTableRow {
  return {
    kind: item.type,
    id: String(item.id),
    title: item.title || "Untitled",
    image_url: item.image_url ?? "",
    languages: parseDashboardLanguages(item.languages),
    status: normalizeStatus(item.status),
    total_days: 0,
    enrolled: item.enrolled_count ?? 0,
    modifiedAt: item.updated_at ?? item.created_at ?? null,
    featured: !!item.featured,
  };
}

export type DashboardTab = "all" | "plans" | "series";

export interface DashboardApiItem {
  id: string;
  type: "plan" | "series";
  title: string;
  image_url?: string | null;
  status: string;
  featured: boolean;
  languages: string[];
  enrolled_count: number;
  plans_count?: number | null;
  updated_at?: string | null;
  created_at?: string | null;
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
  const accessToken = sessionStorage.getItem("accessToken");
  const pageSize = params.pageSize ?? DASHBOARD_PAGE_SIZE;

  const { data } = await axiosInstance.get<DashboardItemsResponse>(
    DASHBOARD_ITEMS_PATH,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        tab: params.tab,
        page: params.page,
        page_size: pageSize,
        ...(params.search?.trim() && { search: params.search.trim() }),
        ...(params.status && { status: params.status }),
        ...(params.language && { language: params.language }),
        ...(params.featured != null && { featured: params.featured }),
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

  return {
    rows: items.map(mapDashboardItemToTableRow),
    pagination,
  };
}
