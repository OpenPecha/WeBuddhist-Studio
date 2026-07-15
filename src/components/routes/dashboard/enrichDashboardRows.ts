import axiosInstance from "@/config/axios-config";
import { getSeries } from "@/components/routes/create-series/api/seriesApi";
import type { DashboardTableRow } from "./dashboardTable";

type CmsPlanDetail = {
  group_id?: string | null;
  series_id?: string | null;
};

/** Dashboard list items may omit group_id; resolve from CMS detail endpoints. */
export async function enrichDashboardRowWithGroupId(
  row: DashboardTableRow,
): Promise<DashboardTableRow> {
  if (row.group_id) return row;

  try {
    if (row.kind === "plan") {
      const { data } = await axiosInstance.get<CmsPlanDetail>(
        `/api/v1/cms/plans/${row.id}`,
      );
      return {
        ...row,
        group_id: data.group_id ?? null,
        series_id: data.series_id ?? row.series_id ?? null,
      };
    }

    const series = await getSeries(row.id);
    return {
      ...row,
      group_id: series.group_id ?? null,
    };
  } catch {
    return row;
  }
}

export async function enrichDashboardRows(
  rows: DashboardTableRow[],
): Promise<DashboardTableRow[]> {
  return Promise.all(rows.map(enrichDashboardRowWithGroupId));
}
