import { fetchDashboardItems } from "@/components/routes/dashboard/dashboardApi";
import type { DashboardTableRow } from "@/components/routes/dashboard/dashboardTable";

/** Group-scoped plan/series list (client-filtered by group_id after enrichment). */
export async function fetchGroupContentRows(
  groupId: string,
  options?: { pageSize?: number },
): Promise<DashboardTableRow[]> {
  const { rows } = await fetchDashboardItems({
    tab: "all",
    page: 1,
    pageSize: options?.pageSize ?? 100,
    group_id: groupId,
  });
  return rows;
}
