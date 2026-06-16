import axiosInstance from "@/config/axios-config";

export interface VerseContent {
  en: string;
  bo: string;
  zh: string;
}

export interface VerseOfDayPayload {
  verses: VerseContent;
  image_urls: string[];
  verse_id: string;
  ref_id: string;
  ref_type: string;
  group_id: string;
  date: string;
}

export interface GroupInfo {
  id: string;
  title: string;
  sub_title: string;
  description: string;
  language: string;
}

export interface VerseOfDayItem {
  id: string;
  verses: VerseContent;
  verse: string | null;
  image_url: string;
  ref_id: string;
  ref_type: string;
  date: string;
  group_info: GroupInfo[];
}

export interface VerseOfDayListResponse {
  verses: VerseOfDayItem[];
  total: number;
}

export interface VerseOfDayResponse {
  id: string;
  verses: VerseContent;
  image_urls: string[];
  verse_id: string;
  ref_id: string;
  ref_type: string;
  group_id: string;
  date: string;
  created_at: string;
  updated_at: string;
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

export const fetchVerseOfDayList = async (): Promise<VerseOfDayListResponse> => {
  const { data } = await axiosInstance.get<VerseOfDayListResponse>(
    `/api/v1/cms/verse-of-day`,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const createVerseOfDay = async (
  payload: VerseOfDayPayload,
): Promise<VerseOfDayResponse> => {
  const { data } = await axiosInstance.post<VerseOfDayResponse>(
    `/api/v1/cms/verse-of-day`,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const updateVerseOfDay = async (
  id: string,
  payload: VerseOfDayPayload,
): Promise<VerseOfDayResponse> => {
  const { data } = await axiosInstance.put<VerseOfDayResponse>(
    `/api/v1/cms/verse-of-day/${id}`,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
};

export const deleteVerseOfDay = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/cms/verse-of-day/${id}`, {
    headers: getAuthHeaders(),
  });
};
