import axiosInstance from "@/config/axios-config";

interface CreateTaskPayload {
  plan_id: string;
  day_id: string;
  title: string;
  estimated_time: number;
}

export const createTask = async (taskData: CreateTaskPayload) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.post(
    `/api/v1/cms/tasks`,
    { ...taskData },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return data;
};

export const uploadImageToS3 = async (file: File, plan_id: string) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post(
    `/api/v1/cms/media/upload`,
    formData,
    {
      params: {
        ...(plan_id && { plan_id: plan_id }),
      },
    },
  );
  return data;
};

export const createSubTasks = async (
  task_id: string,
  subTasksData: { content: string | null; content_type: string }[],
) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.post(
    `/api/v1/cms/sub-tasks`,
    {
      task_id: task_id,
      sub_tasks: subTasksData,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return data;
};

export const updateSubTasks = async (task_id: string, subTasksData: any) => {
  const accessToken = sessionStorage.getItem("accessToken");
  await axiosInstance.put(
    `/api/v1/cms/sub-tasks`,
    {
      task_id: task_id,
      sub_tasks: subTasksData,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

export const fetchTaskDetails = async (task_id: string) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/cms/tasks/${task_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};
