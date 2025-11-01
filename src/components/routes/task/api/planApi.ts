import axiosInstance from "@/config/axios-config";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

export const fetchPlanDetails = async (plan_id: string) => {
  const { data } = await axiosInstance.get(`/api/v1/cms/plans/${plan_id}`, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const createNewDay = async (plan_id: string) => {
  const { data } = await axiosInstance.post(
    `/api/v1/cms/plans/${plan_id}/days`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const deleteDay = async (plan_id: string, day_id: string) => {
  const { data } = await axiosInstance.delete(
    `/api/v1/cms/plans/${plan_id}/days/${day_id}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
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
