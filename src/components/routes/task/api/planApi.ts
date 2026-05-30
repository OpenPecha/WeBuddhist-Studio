import axiosInstance from "@/config/axios-config";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

export interface CmsPlanSummary {
  id: string;
  title: string;
  total_days: number;
}

export interface CmsPlansResponse {
  plans: CmsPlanSummary[];
  skip: number;
  limit: number;
  total: number;
}

export const searchCmsPlans = async (params?: {
  search?: string;
  skip?: number;
  limit?: number;
}) => {
  const { data } = await axiosInstance.get<CmsPlansResponse>(
    `/api/v1/cms/plans`,
    {
      params: {
        search: params?.search?.trim() || undefined,
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 10,
      },
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const fetchPlanDetails = async (plan_id: string) => {
  const { data } = await axiosInstance.get(`/api/v1/cms/plans/${plan_id}`, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const fetchPlanDays = async (plan_id: string) => {
  const { data } = await axiosInstance.get(
    `/api/v1/cms/plans/${plan_id}/days`,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export interface CreateDaysRequest {
  number_of_days?: number;
  source_day_id?: string;
}

export interface DayDTO {
  id: string;
  day_number: number;
  tasks: Record<string, unknown>[];
}

export const createNewDays = async (
  plan_id: string,
  body?: CreateDaysRequest,
) => {
  const { data } = await axiosInstance.post<DayDTO[]>(
    `/api/v1/cms/plans/${plan_id}/days`,
    body ?? {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const deleteDays = async (plan_id: string, day_ids: string[]) => {
  await axiosInstance.delete(`/api/v1/cms/plans/${plan_id}/days`, {
    data: { day_ids },
    headers: getAuthHeaders(),
  });
};

export const deleteTask = async (task_id: string) => {
  const { data } = await axiosInstance.delete(`/api/v1/cms/tasks/${task_id}`, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const reorderDays = async (
  plan_id: string,
  days: Array<{ id: string; day_number: number }>,
) => {
  const { data } = await axiosInstance.put(
    `/api/v1/cms/plans/${plan_id}/reorder-days`,
    {
      days,
    },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export interface PlanDayAudioUploadResponse {
  plan_item_id: string;
  audio_key: string;
  audio_url: string;
  duration_ms: number | null;
  message: string;
}

export interface PlanAudioDTO {
  id: string;
  audio_key: string;
  file_name: string;
  audio_url: string;
  duration_ms: number | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  plan_item_id: string;
  plan_id: string;
  day_number: number;
  created_at: string;
}

export interface PlanAudioListResponse {
  audio: PlanAudioDTO[];
  skip: number;
  limit: number;
  total: number;
}

export const fetchPlanAudioList = async (params?: {
  search?: string;
  plan_id?: string;
  skip?: number;
  limit?: number;
}) => {
  const { data } = await axiosInstance.get<PlanAudioListResponse>(
    `/api/v1/cms/plans/audio`,
    {
      params: {
        search: params?.search?.trim() || undefined,
        plan_id: params?.plan_id || undefined,
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 10,
      },
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const uploadDayAudio = async (
  day_id: string,
  file: File,
  duration_ms?: number,
) => {
  const formData = new FormData();
  formData.append("file", file);
  if (duration_ms != null) {
    formData.append("duration_ms", String(duration_ms));
  }
  const { data } = await axiosInstance.post<PlanDayAudioUploadResponse>(
    `/api/v1/cms/media/upload/day-audio`,
    formData,
    {
      params: { day_id },
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const attachDayAudio = async (
  day_id: string,
  audio_key: string,
  duration_ms?: number | null,
) => {
  const { data } = await axiosInstance.patch<PlanDayAudioUploadResponse>(
    `/api/v1/cms/plans/days/${day_id}/audio`,
    {
      audio_key,
      ...(duration_ms != null ? { duration_ms } : {}),
    },
    { headers: getAuthHeaders() },
  );
  return data;
};

export const deleteDayAudio = async (day_id: string) => {
  await axiosInstance.delete(`/api/v1/cms/plans/days/${day_id}/audio`, {
    headers: getAuthHeaders(),
  });
};
