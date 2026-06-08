import axiosInstance from "@/config/axios-config";

type SearchCommon = {
  query: string;
  limit?: number;
  skip?: number;
};

type SearchTitle = {
  title: string;
  limit?: number;
  offset?: number;
};

export type TextSearchItem = {
  id: string;
  title: string;
  language: string;
  license: string;
};

export type TitleSearchResponse = {
  collection: string | null;
  texts: TextSearchItem[];
  skip: number;
  limit: number;
  has_more: boolean;
};

export const MIN_TITLE_SEARCH_LENGTH = 5;

type SearchTextDetails = {
  textId: string;
  contentId?: string;
  segmentId?: string;
  direction?: "next" | "previous";
  size?: number;
};
export const searchSources = async ({
  query,
  limit = 10,
  skip = 0,
}: SearchCommon) => {
  const { data } = await axiosInstance.get(`/api/v1/search/multilingual`, {
    params: {
      query,
      search_type: "exact",
      limit,
      skip,
    },
  });
  return data;
};

export const searchTitles = async ({
  title,
  limit = 20,
  offset = 0,
}: SearchTitle): Promise<TitleSearchResponse> => {
  if (title.trim().length < MIN_TITLE_SEARCH_LENGTH) {
    return {
      collection: null,
      texts: [],
      skip: offset,
      limit,
      has_more: false,
    };
  }

  const { data } = await axiosInstance.get<TitleSearchResponse>(
    `/api/v1/texts`,
    {
      params: {
        title,
        limit,
        skip: offset,
      },
    },
  );
  return data;
};

export const fetchTextDetails = async ({
  textId,
  contentId,
  segmentId,
  direction = "next",
  size = 20,
}: SearchTextDetails) => {
  const { data } = await axiosInstance.get(`/api/v1/texts/${textId}/details`, {
    params: {
      ...(contentId && { content_id: contentId }),
      ...(segmentId && { segment_id: segmentId }),
      direction,
      size,
    },
  });
  return data;
};

export type { SearchCommon };
