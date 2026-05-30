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
};

export const searchPlans = async (
  params: SearchPlansParams,
): Promise<SearchPlansResponse> => {
  const { data } = await axiosInstance.get("/api/v1/cms/plans", {
    params,
  });
  return data;
};
