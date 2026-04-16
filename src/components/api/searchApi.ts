import axiosInstance from "@/config/axios-config";

type SearchCommon = {
  query: string;
  limit?: number;
  skip?: number;
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
}: {
  title: string;
  limit?: number;
  offset?: number;
}) => {
  const { data } = await axiosInstance.get(`/api/v1/texts/title-search`, {
    params: {
      title,
      limit,
      offset,
    },
  });
  return data;
};

export const fetchTextDetails = async ({
  textId,
  contentId,
  segmentId,
  direction = "next",
  size = 20,
}: {
  textId: string;
  contentId?: string;
  segmentId?: string;
  direction?: "next" | "previous";
  size?: number;
}) => {
  const { data } = await axiosInstance.post(`/api/v1/texts/${textId}/details`, {
    ...(contentId && { content_id: contentId }),
    ...(segmentId && { segment_id: segmentId }),
    direction,
    size,
  });
  return data;
};

export type { SearchCommon };
