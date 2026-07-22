import axiosInstance from "@/config/axios-config";
import { uploadImageToS3 } from "@/components/routes/task/api/taskApi";

export interface ChantCollectionItemDTO {
  id: string;
  text_id: string;
  title: string;
  language?: string;
  type?: string;
  display_order: number;
}

export interface ChantCollectionDTO {
  id: string;
  group_id: string;
  name: string;
  img_url?: string;
  item_count: number;
  created_at: string;
}

export interface ChantCollectionDetailDTO {
  id: string;
  group_id: string;
  name: string;
  img_url?: string;
  created_at: string;
  items: ChantCollectionItemDTO[];
}

export interface ChantCollectionsResponse {
  collections: ChantCollectionDTO[];
  skip: number;
  limit: number;
  total: number;
}

export interface CreateChantCollectionRequest {
  name: string;
  img_url?: string;
}

export interface UpdateChantCollectionRequest {
  name?: string;
  img_url?: string;
}

export interface AddChantItemsRequest {
  text_ids: string[];
}

export interface AddChantItemsResponse {
  collection_id: string;
  added_count: number;
  items: ChantCollectionItemDTO[];
}

export interface ReorderChantItemsRequest {
  item_ids: string[];
}

const BASE_URL = "/api/v1/cms/author/groups";

export const fetchChantCollections = async (
  groupId: string,
  skip = 0,
  limit = 20,
): Promise<ChantCollectionsResponse> => {
  const { data } = await axiosInstance.get<ChantCollectionsResponse>(
    `${BASE_URL}/${groupId}/recitation-collections`,
    { params: { skip, limit } },
  );
  return data;
};

export const fetchChantCollection = async (
  groupId: string,
  collectionId: string,
): Promise<ChantCollectionDetailDTO> => {
  const { data } = await axiosInstance.get<ChantCollectionDetailDTO>(
    `${BASE_URL}/${groupId}/recitation-collections/${collectionId}`,
  );
  return data;
};

export const createChantCollection = async (
  groupId: string,
  body: CreateChantCollectionRequest,
): Promise<ChantCollectionDetailDTO> => {
  const { data } = await axiosInstance.post<ChantCollectionDetailDTO>(
    `${BASE_URL}/${groupId}/recitation-collections`,
    body,
  );
  return data;
};

export const updateChantCollection = async (
  groupId: string,
  collectionId: string,
  body: UpdateChantCollectionRequest,
): Promise<ChantCollectionDetailDTO> => {
  const { data } = await axiosInstance.patch<ChantCollectionDetailDTO>(
    `${BASE_URL}/${groupId}/recitation-collections/${collectionId}`,
    body,
  );
  return data;
};

export const deleteChantCollection = async (
  groupId: string,
  collectionId: string,
): Promise<void> => {
  await axiosInstance.delete(
    `${BASE_URL}/${groupId}/recitation-collections/${collectionId}`,
  );
};

export const addChantItems = async (
  groupId: string,
  collectionId: string,
  textIds: string[],
): Promise<AddChantItemsResponse> => {
  const { data } = await axiosInstance.post<AddChantItemsResponse>(
    `${BASE_URL}/${groupId}/recitation-collections/${collectionId}/items`,
    { text_ids: textIds },
  );
  return data;
};

export const deleteChantItem = async (
  groupId: string,
  collectionId: string,
  itemId: string,
): Promise<void> => {
  await axiosInstance.delete(
    `${BASE_URL}/${groupId}/recitation-collections/${collectionId}/items/${itemId}`,
  );
};

export const reorderChantItems = async (
  groupId: string,
  collectionId: string,
  itemIds: string[],
): Promise<ChantCollectionDetailDTO> => {
  const { data } = await axiosInstance.put<ChantCollectionDetailDTO>(
    `${BASE_URL}/${groupId}/recitation-collections/${collectionId}/items/reorder`,
    { item_ids: itemIds },
  );
  return data;
};

export const uploadChantImage = async (file: File): Promise<string> => {
  const { key } = await uploadImageToS3(file, "");
  return key;
};

export interface RecitationDTO {
  title: string;
  text_id: string;
  image_url?: string;
}

export interface RecitationsSearchResponse {
  recitations: RecitationDTO[];
  skip: number;
  limit: number;
  total: number;
}

export const searchRecitations = async (params: {
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<{
  items: { id: string; title: string; image_url?: string }[];
  skip: number;
  limit: number;
  total: number;
}> => {
  const { data } = await axiosInstance.get<RecitationsSearchResponse>(
    "/api/v1/recitations",
    {
      params: {
        search: params.search,
        language: "EN",
        skip: params.skip ?? 0,
        limit: params.limit ?? 20,
      },
    },
  );
  
  return {
    items: data.recitations.map((r) => ({
      id: r.text_id,
      title: r.title,
      image_url: r.image_url,
    })),
    skip: data.skip,
    limit: data.limit,
    total: data.total,
  };
};
