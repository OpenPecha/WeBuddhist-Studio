import axiosInstance from "@/config/axios-config";

type SearchCommon = {
  query: string;
  language?: string;
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

export type { SearchCommon };
