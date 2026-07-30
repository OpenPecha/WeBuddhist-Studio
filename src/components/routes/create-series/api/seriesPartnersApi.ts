import axiosInstance from "@/config/axios-config";

export type SeriesPartnerItemDTO = {
  id: string;
  group_id: string;
  group_name: string;
  group_image: string | null;
  is_owner: boolean;
};

export type SeriesPartnerListResponse = {
  partners: SeriesPartnerItemDTO[];
};

export type AddSeriesPartnerRequest = {
  group_id: string;
};

const partnersPath = (seriesId: string) =>
  `/api/v1/cms/series/${seriesId}/partners`;

export const listSeriesPartners = async (
  seriesId: string,
  language?: string,
): Promise<SeriesPartnerItemDTO[]> => {
  const { data } = await axiosInstance.get<SeriesPartnerListResponse>(
    partnersPath(seriesId),
    { params: language ? { language } : undefined },
  );
  return data?.partners ?? [];
};

export const addSeriesPartner = async (
  seriesId: string,
  groupId: string,
  language?: string,
): Promise<SeriesPartnerItemDTO> => {
  const { data } = await axiosInstance.post<SeriesPartnerItemDTO>(
    partnersPath(seriesId),
    { group_id: groupId } satisfies AddSeriesPartnerRequest,
    { params: language ? { language } : undefined },
  );
  return data;
};

export const removeSeriesPartner = async (
  seriesId: string,
  groupId: string,
): Promise<void> => {
  await axiosInstance.delete(`${partnersPath(seriesId)}/${groupId}`);
};
