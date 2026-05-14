import axiosInstance from "@/config/axios-config";
import type { DashboardTableRow } from "./dashboardTable";

/**
 * Placeholder path for a future unified CMS feed. The request is expected to fail
 * until the backend exists; the dashboard falls back to {@link MOCK_DASHBOARD_ALL_ROWS}.
 */
export const DASHBOARD_ALL_IMAGINARY_PATH =
  "/api/v1/cms/dashboard/unified-feed";

export const MOCK_DASHBOARD_ALL_ROWS: DashboardTableRow[] = [
  {
    kind: "plan",
    id: "mock-plan-1",
    title: "Abhidhamma in a year (sample)",
    image_url:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=320&h=180&fit=crop",
    languages: ["EN", "ZH"],
    status: "DRAFT",
    total_days: 7,
    enrolled: 40,
    modifiedAt: null,
    dateModifiedLabel: "2 hours ago",
    featured: true,
  },
  {
    kind: "series",
    id: "mock-series-1",
    title: "7 noble Truth (sample series)",
    image_url:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=320&h=180&fit=crop",
    languages: ["ZH", "BO", "EN"],
    status: "UNPUBLISHED",
    total_days: 0,
    enrolled: 40,
    modifiedAt: null,
    dateModifiedLabel: "Yesterday",
    featured: false,
  },
  {
    kind: "series",
    id: "mock-series-1",
    title: "7 noble Truth (sample series)",
    image_url:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=320&h=180&fit=crop",
    languages: ["ZH", "BO", "EN"],
    status: "ARCHIVED",
    total_days: 0,
    enrolled: 40,
    modifiedAt: null,
    dateModifiedLabel: "Yesterday",
    featured: false,
  },
  {
    kind: "plan",
    id: "mock-plan-2",
    title: "Morning meditation (sample)",
    image_url:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=320&h=180&fit=crop",
    languages: ["BO"],
    status: "PUBLISHED",
    total_days: 14,
    enrolled: 12,
    modifiedAt: null,
    dateModifiedLabel: "Last week",
    featured: false,
  },
];

export interface DashboardAllFeedResult {
  rows: DashboardTableRow[];
  total: number;
  usedMock: boolean;
}

function filterRowsBySearch(rows: DashboardTableRow[], search: string) {
  if (!search.trim()) return rows;
  const q = search.trim().toLowerCase();
  return rows.filter((r) => r.title.toLowerCase().includes(q));
}

/**
 * Calls the imaginary unified feed endpoint. On any failure (404, network, etc.),
 * returns {@link MOCK_DASHBOARD_ALL_ROWS} sliced for the requested page.
 */
export async function fetchDashboardAllImaginary(
  page: number,
  limit: number,
  search: string,
): Promise<DashboardAllFeedResult> {
  const skip = (page - 1) * limit;
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    const { data } = await axiosInstance.get(DASHBOARD_ALL_IMAGINARY_PATH, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        skip,
        limit,
        ...(search && { search }),
      },
    });
    const rows = (data?.rows ?? data?.items ?? []) as DashboardTableRow[];
    const total = typeof data?.total === "number" ? data.total : rows.length;
    return { rows, total, usedMock: false };
  } catch {
    const filtered = filterRowsBySearch(MOCK_DASHBOARD_ALL_ROWS, search);
    const slice = filtered.slice(skip, skip + limit);
    return {
      rows: slice,
      total: filtered.length,
      usedMock: true,
    };
  }
}
