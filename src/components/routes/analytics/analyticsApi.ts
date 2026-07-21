import axiosInstance from "@/config/axios-config";

export type AnalyticsDateRange = {
  start_date: string;
  end_date: string;
};

export type AnalyticsUserStats = {
  total_users: number;
  new_users_this_month: number;
  new_users_in_range: number;
};

export type AnalyticsTimePoint = {
  date: string;
  new_users: number;
  joins: number;
  completions: number;
};

export type AnalyticsTopPlan = {
  id: string;
  title: string;
  series_id: string | null;
  series_name: string | null;
  join_count: number;
  completion_count: number;
};

export type AnalyticsOverview = {
  date_range: AnalyticsDateRange;
  users: AnalyticsUserStats;
  top_plans: AnalyticsTopPlan[];
  timeline: AnalyticsTimePoint[];
  generated_at: string;
};

export type FetchAnalyticsParams = {
  start_date: string;
  end_date: string;
  group_id?: string;
  top_limit?: number;
};

export async function fetchAnalyticsOverview(
  params: FetchAnalyticsParams,
): Promise<AnalyticsOverview> {
  const { data } = await axiosInstance.get<AnalyticsOverview>(
    "/api/v1/cms/analytics/overview",
    {
      params: {
        start_date: params.start_date,
        end_date: params.end_date,
        ...(params.group_id ? { group_id: params.group_id } : {}),
        top_limit: params.top_limit ?? 10,
      },
    },
  );
  return data;
}
