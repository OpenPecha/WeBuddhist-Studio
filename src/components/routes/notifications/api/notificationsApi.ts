import axiosInstance from "@/config/axios-config";
import { resolveCmsApiPath } from "@/lib/cmsApiPath";

export interface NotificationActionDTO {
  label: string;
  method: string;
  path: string;
}

export interface NotificationDTO {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  reference_type?: string | null;
  reference_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
  actions: NotificationActionDTO[];
  created_at: string;
}

export interface NotificationListResponse {
  notifications: NotificationDTO[];
  skip: number;
  limit: number;
  total: number;
}

export interface FetchNotificationsParams {
  unread_only?: boolean;
  skip?: number;
  limit?: number;
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

export const fetchNotifications = async (
  params: FetchNotificationsParams = {},
): Promise<NotificationListResponse> => {
  const { data } = await axiosInstance.get<NotificationListResponse>(
    `/api/v1/cms/notifications`,
    {
      headers: getAuthHeaders(),
      params: {
        unread_only: params.unread_only ?? false,
        skip: params.skip ?? 0,
        limit: params.limit ?? 20,
      },
    },
  );
  return data;
};

export const markNotificationRead = async (
  notificationId: string,
): Promise<NotificationDTO> => {
  const { data } = await axiosInstance.patch<NotificationDTO>(
    `/api/v1/cms/notifications/${notificationId}/read`,
    {},
    { headers: getAuthHeaders() },
  );
  return data;
};

export const executeNotificationAction = async (
  action: NotificationActionDTO,
): Promise<unknown> => {
  const url = resolveCmsApiPath(action.path);
  const method = action.method.toUpperCase();
  const { data } = await axiosInstance.request({
    method,
    url,
    headers: getAuthHeaders(),
  });
  return data;
};
