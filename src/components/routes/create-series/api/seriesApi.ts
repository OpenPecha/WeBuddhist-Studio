import axiosInstance from "@/config/axios-config";
import type {
  LanguageCode,
  SeriesFormData,
  SeriesPlan,
} from "@/schema/SeriesSchema";

export type CreateSeriesPayload = {
  name: Record<string, { title: string; description: string }>;
  image?: string | null;
  featured?: boolean;
  author_id: string;
  created_by: string;
};

export type SeriesPlansReplacePayload = {
  plans: Partial<Record<LanguageCode, string[]>>;
};

export type AuthorInfo = {
  id: string;
};

export const fetchAuthorInfo = async (): Promise<AuthorInfo> => {
  const { data } = await axiosInstance.get(`/api/v1/authors/info`);
  return data;
};

export type SeriesPlanDTO = {
  id: string;
  title: string;
  description?: string | null;
  language: string;
  image_url?: string | null;
  image_key?: string | null;
  display_order?: number | null;
};

export type SeriesDetailDTO = {
  id: string;
  name: Record<string, unknown>;
  image?: string | null;
  image_key?: string | null;
  author_id: string;
  featured: boolean;
  status: string;
  plans: SeriesPlanDTO[];
  total_days?: number;
};

const authHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

export const getSeries = async (seriesId: string): Promise<SeriesDetailDTO> => {
  const { data } = await axiosInstance.get(`/api/v1/cms/series/${seriesId}`, {
    headers: authHeaders(),
  });
  return data;
};

export const postSeries = async (body: CreateSeriesPayload) => {
  const { data } = await axiosInstance.post(`/api/v1/cms/series`, body, {
    headers: authHeaders(),
  });
  return data as SeriesDetailDTO;
};

/** `PUT /cms/series/{id}` — contract mirrors create body (add when backend exposes it in OpenAPI). */
export const putUpdateSeries = async ({
  seriesId,
  body,
}: {
  seriesId: string;
  body: CreateSeriesPayload;
}) => {
  const { data } = await axiosInstance.put(
    `/api/v1/cms/series/${seriesId}`,
    body,
    { headers: authHeaders() },
  );
  return data as SeriesDetailDTO;
};

/** `PUT /cms/series/{id}/plans` — full snapshot per language (empty arrays clear). */
export const putSeriesPlans = async ({
  seriesId,
  body,
}: {
  seriesId: string;
  body: SeriesPlansReplacePayload;
}) => {
  const { data } = await axiosInstance.put(
    `/api/v1/cms/series/${seriesId}/plans`,
    body,
    { headers: authHeaders() },
  );
  return data;
};

function normalizeLang(raw: string): LanguageCode | null {
  const u = raw.trim().toUpperCase();
  if (u === "EN" || u === "BO" || u === "ZH") return u;
  return null;
}

export function mapSeriesDetailToFormData(
  dto: SeriesDetailDTO,
): SeriesFormData {
  const languages: SeriesFormData["languages"] = {};
  const name = dto.name ?? {};
  const order: LanguageCode[] = ["EN", "BO", "ZH"];
  for (const code of order) {
    const raw = name[code];
    if (raw == null) continue;
    if (typeof raw === "string") {
      languages[code] = { title: raw.trim(), description: "" };
    } else if (typeof raw === "object") {
      const o = raw as Record<string, unknown>;
      languages[code] = {
        title: String(o.title ?? "").trim(),
        description: String(o.description ?? "").trim(),
      };
    }
  }

  const buckets: Partial<
    Record<LanguageCode, { item: SeriesPlan; ord: number }[]>
  > = {};
  for (const p of dto.plans ?? []) {
    const code = normalizeLang(p.language);
    if (!code) continue;
    const ord =
      typeof p.display_order === "number" && !Number.isNaN(p.display_order)
        ? p.display_order
        : 1_000_000;
    const item: SeriesPlan = {
      id: String(p.id),
      title: p.title,
      image_url: p.image_url ?? undefined,
    };
    if (!buckets[code]) buckets[code] = [];
    buckets[code]!.push({ item, ord });
  }
  const plans: SeriesFormData["plans"] = {};
  for (const code of order) {
    const row = buckets[code];
    if (!row?.length) continue;
    plans[code] = [...row].sort((a, b) => a.ord - b.ord).map((x) => x.item);
  }

  const imageKey =
    (dto.image_key && dto.image_key.trim()) ||
    (dto.image && !/^https?:\/\//i.test(dto.image) ? dto.image.trim() : "") ||
    "";

  return {
    languages,
    plans,
    image_url: imageKey,
  };
}

export function buildSeriesNameJson(
  languages: SeriesFormData["languages"],
): Record<string, { title: string; description: string }> {
  const out: Record<string, { title: string; description: string }> = {};
  const order: LanguageCode[] = ["EN", "BO", "ZH"];
  for (const code of order) {
    const block = languages[code];
    if (block) {
      out[code] = {
        title: block.title.trim(),
        description: block.description.trim(),
      };
    }
  }
  return out;
}

export function buildSeriesCreateBody(
  data: SeriesFormData,
  author: AuthorInfo,
  options?: { featured?: boolean },
): CreateSeriesPayload {
  const image = data.image_url.trim();
  return {
    name: buildSeriesNameJson(data.languages),
    ...(image ? { image } : {}),
    featured: options?.featured ?? false,
    author_id: author.id,
    created_by: author.id,
  };
}

/** Plan id lists per language; array order is display order for the API. */
export function buildPlansReplacePayload(
  data: SeriesFormData,
): SeriesPlansReplacePayload {
  const plans: Partial<Record<LanguageCode, string[]>> = {};
  const order: LanguageCode[] = ["EN", "BO", "ZH"];
  for (const code of order) {
    const list = data.plans[code] ?? [];
    plans[code] = list.map((p) => p.id);
  }
  return { plans };
}
