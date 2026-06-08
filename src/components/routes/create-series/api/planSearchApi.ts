import axiosInstance from "@/config/axios-config";

export type PlanAuthor = {
  id: string;
  firstname: string;
  lastname: string;
  image_url: string;
  image_key: string | null;
};

export type Plan = {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty_level: string;
  image_url: string;
  image_key: string | null;
  total_days: number;
  tags: string[];
  status: string;
  featured: boolean;
  subscription_count: number;
  author: PlanAuthor;
  start_date: string | null;
  group_id?: string | null;
};

export type SearchPlansResponse = {
  plans: Plan[];
  skip: number;
  limit: number;
  total: number;
};

export type SearchPlansParams = {
  search?: string;
  tag?: string;
  language?: string;
  skip?: number;
  limit?: number;
  group_id?: string;
};

export const searchPlans = async (
  params: SearchPlansParams,
): Promise<SearchPlansResponse> => {
  const { group_id, ...rest } = params;
  const { data } = await axiosInstance.get<SearchPlansResponse>(
    "/api/v1/cms/plans",
    {
      params: {
        ...rest,
        ...(group_id ? { group_id } : {}),
      },
    },
  );

  if (!group_id) {
    return data;
  }

  const plans = (data.plans ?? []).filter((plan) => {
    if (plan.group_id != null) {
      return plan.group_id === group_id;
    }
    return true;
  });

  return { ...data, plans };
};
