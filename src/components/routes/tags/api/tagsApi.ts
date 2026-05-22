import axiosInstance from "@/config/axios-config";

export interface Tag {
  id: string;
  name: string;
  image: string | null;
  image_key: string | null;
  description: string | null;
  plan_ids: string[];
}

/** Tag shape embedded on plan list/detail API responses */
export type PlanTagSummary = Omit<Tag, "plan_ids">;

export const planTagsToIds = (
  tags: (PlanTagSummary | string)[] | undefined,
): string[] => {
  if (!tags?.length) return [];
  return tags.map((tag) => (typeof tag === "string" ? tag : tag.id));
};

export interface TagsListResponse {
  tags: Tag[];
  skip: number;
  limit: number;
  total: number;
}

export interface TagPayload {
  name: string;
  image_key?: string | null;
  description?: string | null;
  plan_ids: string[];
}

export interface PlanOption {
  id: string;
  title: string;
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

export const fetchTags = async (
  page: number,
  limit: number,
  search: string,
): Promise<TagsListResponse> => {
  const skip = (page - 1) * limit;
  const { data } = await axiosInstance.get<TagsListResponse>(
    `/api/v1/cms/tags`,
    {
      headers: getAuthHeaders(),
      params: {
        skip,
        limit,
        ...(search && { search }),
      },
    },
  );
  return data;
};

export const createTag = async (payload: TagPayload): Promise<Tag> => {
  const { data } = await axiosInstance.post<Tag>(`/api/v1/cms/tags`, payload, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const updateTag = async (
  tagId: string,
  payload: TagPayload,
): Promise<Tag> => {
  const { data } = await axiosInstance.put<Tag>(
    `/api/v1/cms/tags/${tagId}`,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const deleteTag = async (tagId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/cms/tags/${tagId}`, {
    headers: getAuthHeaders(),
  });
};

export const fetchPlanOptions = async (): Promise<PlanOption[]> => {
  const { data } = await axiosInstance.get(`/api/v1/cms/plans`, {
    headers: getAuthHeaders(),
    params: { skip: 0, limit: 500 },
  });
  return (data.plans ?? []).map((plan: { id: string; title: string }) => ({
    id: plan.id,
    title: plan.title,
  }));
};
