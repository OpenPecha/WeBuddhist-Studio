import { fetchDashboardItems } from "@/components/routes/dashboard/dashboardApi";

export type SeriesOption = {
  id: string;
  title: string;
  image_url?: string;
};

export type SearchSeriesResponse = {
  series: SeriesOption[];
  skip: number;
  limit: number;
  total: number;
};

export const searchSeries = async (params: {
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<SearchSeriesResponse> => {
  const limit = params.limit ?? 20;
  const skip = params.skip ?? 0;
  const page = Math.floor(skip / limit) + 1;

  const result = await fetchDashboardItems({
    tab: "series",
    page,
    pageSize: limit,
    search: params.search,
  });

  return {
    series: result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      image_url: row.image_url || undefined,
    })),
    skip,
    limit,
    total: result.pagination.total,
  };
};
