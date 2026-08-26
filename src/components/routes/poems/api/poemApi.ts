import axiosInstance from "@/config/axios-config";

export type PoemStatus = "DRAFT" | "PUBLISHED";

export interface PoemItem {
  id: string;
  title: string;
  content: string;
  author_name: string;
  chapter_name: string | null;
  image_url: string | null;
  status: PoemStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PoemsListResponse {
  poems: PoemItem[];
  skip: number;
  limit: number;
  total: number;
}

export interface CreatePoemPayload {
  title: string;
  content: string;
  author_name: string;
  chapter_name?: string | null;
  image_key?: string | null;
  status?: PoemStatus;
}

export interface UpdatePoemPayload {
  title?: string;
  content?: string;
  author_name?: string;
  chapter_name?: string | null;
  image_key?: string | null;
  status?: PoemStatus;
}

export type FetchPoemsParams = {
  page?: number;
  limit?: number;
  status?: PoemStatus;
  chapterName?: string;
  authorName?: string;
};

export const fetchPoemsList = async (
  params: FetchPoemsParams = {},
): Promise<PoemsListResponse> => {
  const { page = 1, limit = 10, status, chapterName, authorName } = params;
  const { data } = await axiosInstance.get<PoemsListResponse>(
    `/api/v1/cms/poems`,
    {
      params: {
        skip: (page - 1) * limit,
        limit,
        ...(status && { status }),
        ...(chapterName?.trim() && { chapter_name: chapterName.trim() }),
        ...(authorName?.trim() && { author_name: authorName.trim() }),
      },
    },
  );
  return data;
};

export const fetchPoemDetail = async (id: string): Promise<PoemItem> => {
  const { data } = await axiosInstance.get<PoemItem>(`/api/v1/cms/poems/${id}`);
  return data;
};

export const createPoem = async (
  payload: CreatePoemPayload,
): Promise<PoemItem> => {
  const { data } = await axiosInstance.post<PoemItem>(
    `/api/v1/cms/poems`,
    payload,
  );
  return data;
};

export const updatePoem = async (
  id: string,
  payload: UpdatePoemPayload,
): Promise<PoemItem> => {
  const { data } = await axiosInstance.patch<PoemItem>(
    `/api/v1/cms/poems/${id}`,
    payload,
  );
  return data;
};

export const deletePoem = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/cms/poems/${id}`);
};
