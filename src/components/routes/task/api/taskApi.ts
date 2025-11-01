import axiosInstance from "@/config/axios-config";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

interface CreateTaskPayload {
  plan_id: string;
  day_id: string;
  title: string;
  estimated_time: number;
}

export const createTask = async (taskData: CreateTaskPayload) => {
  const { data } = await axiosInstance.post(
    `/api/v1/cms/tasks`,
    { ...taskData },
    {
      headers: getAuthHeaders(),
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
  subTasksData: {
    content: string | null;
    content_type: string;
    display_order: number;
  }[],
) => {
  const { data } = await axiosInstance.post(
    `/api/v1/cms/sub-tasks`,
    {
      task_id: task_id,
      sub_tasks: subTasksData,
    },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const updateSubTasks = async (
  task_id: string,
  subTasksData: {
    id: string | null;
    content: string | null;
    content_type: string;
    display_order: number;
  }[],
) => {
  await axiosInstance.put(
    `/api/v1/cms/sub-tasks`,
    {
      task_id: task_id,
      sub_tasks: subTasksData,
    },
    {
      headers: getAuthHeaders(),
    },
  );
};

export const fetchTaskDetails = async (task_id: string) => {
  const { data } = await axiosInstance.get(`/api/v1/cms/tasks/${task_id}`, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const updateTaskTitle = async (task_id: string, title: string) => {
  const { data } = await axiosInstance.put(
    `/api/v1/cms/tasks/${task_id}`,
    { title },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const ChangeTaskDay = async (task_id: string, target_day_id: string) => {
  const { data } = await axiosInstance.patch(
    `/api/v1/cms/tasks/${task_id}`,
    {
      target_day_id,
    },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const reorderTasks = async (
  day_id: string,
  tasks: Array<{ task_id: string; display_order: number }>,
) => {
  const { data } = await axiosInstance.put(
    `/api/v1/cms/tasks/${day_id}`,
    {
      tasks,
    },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};
