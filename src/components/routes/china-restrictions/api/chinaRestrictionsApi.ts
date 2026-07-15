import axiosInstance from "@/config/axios-config";

export const RESTRICTED_ITEM_TYPES = [
  "MANTRA",
  "ACCUMULATOR",
  "GROUP_ACCUMULATOR",
  "PLAN",
  "SERIES",
  "GROUP",
  "RECITATION",
  "RECITATION_COLLECTION",
] as const;

export type RestrictedItemType = (typeof RESTRICTED_ITEM_TYPES)[number];

export type ChinaRestrictedItemDTO = {
  id: string;
  item_type: RestrictedItemType;
  item_id: string;
  title?: string | null;
  subtitle?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type ChinaRestrictedItemListResponse = {
  items: ChinaRestrictedItemDTO[];
  skip: number;
  limit: number;
  total: number;
};

export type ChinaRestrictionCandidateDTO = {
  id: string;
  title: string;
  subtitle?: string | null;
};

export type ChinaRestrictionCandidateListResponse = {
  items: ChinaRestrictionCandidateDTO[];
  skip: number;
  limit: number;
  total: number;
};

export type FetchChinaRestrictedItemsParams = {
  skip?: number;
  limit?: number;
  item_type?: RestrictedItemType;
};

export type SearchChinaRestrictionCandidatesParams = {
  item_type: RestrictedItemType;
  search?: string;
  skip?: number;
  limit?: number;
};

export type CreateChinaRestrictedItemPayload = {
  item_type: RestrictedItemType;
  item_id: string;
};

export const fetchChinaRestrictedItems = async (
  params: FetchChinaRestrictedItemsParams = {},
): Promise<ChinaRestrictedItemListResponse> => {
  const { data } = await axiosInstance.get<ChinaRestrictedItemListResponse>(
    `/api/v1/cms/admin/china-restrictions`,
    {
      params: {
        skip: params.skip ?? 0,
        limit: params.limit ?? 20,
        ...(params.item_type && { item_type: params.item_type }),
      },
    },
  );
  return data;
};

export const searchChinaRestrictionCandidates = async (
  params: SearchChinaRestrictionCandidatesParams,
): Promise<ChinaRestrictionCandidateListResponse> => {
  const { data } =
    await axiosInstance.get<ChinaRestrictionCandidateListResponse>(
      `/api/v1/cms/admin/china-restrictions/candidates`,
      {
        params: {
          item_type: params.item_type,
          skip: params.skip ?? 0,
          limit: params.limit ?? 20,
          ...(params.search?.trim() && { search: params.search.trim() }),
        },
      },
    );
  return data;
};

export const createChinaRestrictedItem = async (
  payload: CreateChinaRestrictedItemPayload,
) => {
  const { data } = await axiosInstance.post(
    `/api/v1/cms/admin/china-restrictions`,
    payload,
  );
  return data;
};

export const deleteChinaRestrictedItem = async (rowId: string) => {
  await axiosInstance.delete(`/api/v1/cms/admin/china-restrictions/${rowId}`);
};
