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
