import axiosInstance from "@/config/axios-config";

export type NotificationCategory = "group_invite" | (string & {});

export interface NotificationDTO {
  id: string;
  title: string;
  description?: string | null;
  category: NotificationCategory;
  reference_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
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

export const isGroupInviteNotification = (
  notification: NotificationDTO,
): boolean =>
  notification.category === "group_invite" &&
  Boolean(notification.reference_id);
