import axiosInstance from "@/config/axios-config";

export interface GroupAccumulatorImage {
  thumbnail: string;
  medium: string;
  original: string;
}

export interface GroupAccumulatorDTO {
  id: string;
  preset_accumulator_id: string | null;
  group_id: string;
  title: string | null;
  image: GroupAccumulatorImage | null;
  image_key: string | null;
  target_count: number | null;
  start_date: string | null;
  end_date: string | null;
  member_count?: number;
  created_at: string;
  updated_at: string | null;
}

export interface GroupAccumulatorsResponse {
  accumulators: GroupAccumulatorDTO[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateGroupAccumulatorRequest {
  accumulator_id?: string | null;
  title?: string | null;
  image_key?: string | null;
  target_count?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

export type UpdateGroupAccumulatorRequest = CreateGroupAccumulatorRequest;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

export function resolveGroupAccumulatorImageUrl(
  accumulator: Pick<GroupAccumulatorDTO, "image">,
): string | null {
  const image = accumulator.image;
  if (!image) return null;
  return image.medium || image.thumbnail || image.original || null;
}

export const fetchGroupAccumulators = async (
  groupId: string,
  params?: { skip?: number; limit?: number },
): Promise<GroupAccumulatorsResponse> => {
  const { data } = await axiosInstance.get<GroupAccumulatorsResponse>(
    `/api/v1/cms/groups/${groupId}/accumulators`,
    {
      headers: getAuthHeaders(),
      params: {
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 100,
      },
    },
  );
  return data;
};

export const createGroupAccumulator = async (
  groupId: string,
  payload: CreateGroupAccumulatorRequest,
): Promise<GroupAccumulatorDTO> => {
  const { data } = await axiosInstance.post<GroupAccumulatorDTO>(
    `/api/v1/cms/groups/${groupId}/accumulators`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const updateGroupAccumulator = async (
  groupId: string,
  groupAccumulatorId: string,
  payload: UpdateGroupAccumulatorRequest,
): Promise<GroupAccumulatorDTO> => {
  const { data } = await axiosInstance.put<GroupAccumulatorDTO>(
    `/api/v1/cms/groups/${groupId}/accumulators/${groupAccumulatorId}`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

export const deleteGroupAccumulator = async (
  groupId: string,
  groupAccumulatorId: string,
): Promise<void> => {
  await axiosInstance.delete(
    `/api/v1/cms/groups/${groupId}/accumulators/${groupAccumulatorId}`,
    { headers: getAuthHeaders() },
  );
};
