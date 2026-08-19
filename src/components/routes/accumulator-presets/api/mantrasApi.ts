import axiosInstance from "@/config/axios-config";
import type { LanguageCode } from "@/schema/SeriesSchema";
import type { FkOption } from "@/components/routes/groups/components/FkMultiSearchSelector";

export interface MantraMetadataDTO {
  id: string;
  mantra: string;
  title?: string | null;
  pronunciation?: string | null;
  language: string;
}

export interface MantraDTO {
  id: string;
  audio_url?: string | null;
  mala_image_id?: string | null;
  mala_image_url?: string | null;
  metadata: MantraMetadataDTO[];
}

export interface MantraResponse {
  mantras: MantraDTO[];
}

export interface MantraMetadataInput {
  language: LanguageCode;
  mantra: string;
  title?: string | null;
  pronunciation?: string | null;
}

export interface CreateMantraPayload {
  audio_url?: string | null;
  mala_image_id?: string | null;
  metadata: MantraMetadataInput[];
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

export function mantraDisplayLabel(mantra: MantraDTO): string {
  const meta = mantra.metadata?.[0];
  const title = meta?.title?.trim();
  if (title) return title;
  const text = meta?.mantra?.trim();
  if (text) return text.length > 60 ? `${text.slice(0, 57)}…` : text;
  return "Untitled mantra";
}

export const fetchMantras = async (
  language?: string,
): Promise<MantraResponse> => {
  const { data } = await axiosInstance.get<MantraResponse>(`/api/v1/mantra`, {
    params: language ? { language } : undefined,
  });
  return data;
};

export const createMantra = async (
  payload: CreateMantraPayload,
): Promise<MantraDTO> => {
  const { data } = await axiosInstance.post<MantraDTO>(
    `/api/v1/cms/mantras`,
    payload,
    { headers: getAuthHeaders() },
  );
  return data;
};

/** Client-side filtered mantra search for EventLinkPicker. */
export async function searchMantrasForPicker(params: {
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<{
  items: FkOption[];
  skip: number;
  limit: number;
  total: number;
}> {
  const skip = params.skip ?? 0;
  const limit = params.limit ?? 20;
  const { mantras } = await fetchMantras();
  const term = params.search?.trim().toLowerCase() ?? "";

  const filtered = mantras.filter((mantra) => {
    if (!term) return true;
    return mantra.metadata.some((meta) => {
      const haystack = [meta.title, meta.mantra, meta.pronunciation]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  });

  const page = filtered.slice(skip, skip + limit);
  return {
    items: page.map((mantra) => ({
      id: mantra.id,
      title: mantraDisplayLabel(mantra),
      image_url: mantra.mala_image_url ?? undefined,
    })),
    skip,
    limit,
    total: filtered.length,
  };
}
