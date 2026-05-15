import axiosInstance from "@/config/axios-config";
import type {
  LanguageCode,
  SeriesFormData,
  SeriesPlan,
} from "@/schema/SeriesSchema";

export type SeriesPayload = {
  name: Record<string, { title: string; description: string }>;
  image_key?: string;
  featured: boolean;
  plans: Partial<Record<LanguageCode, string[]>>;
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

export const postSeries = async (body: SeriesPayload) => {
  const { data } = await axiosInstance.post(`/api/v1/cms/series`, body, {
    headers: authHeaders(),
  });
  return data as SeriesDetailDTO;
};

export const putUpdateSeries = async ({
  seriesId,
  body,
}: {
  seriesId: string;
  body: SeriesPayload;
}) => {
  const { data } = await axiosInstance.put(
    `/api/v1/cms/series/${seriesId}`,
    body,
    { headers: authHeaders() },
  );
  return data as SeriesDetailDTO;
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

/** Plan ids per added language; array order is display order. */
export function buildSeriesPlansJson(
  data: SeriesFormData,
  languageCodes: LanguageCode[],
): Partial<Record<LanguageCode, string[]>> {
  const plans: Partial<Record<LanguageCode, string[]>> = {};
  for (const code of languageCodes) {
    const list = data.plans[code] ?? [];
    plans[code] = list.map((p) => p.id);
  }
  return plans;
}

export function buildSeriesWriteBody(
  data: SeriesFormData,
  featured: boolean,
): SeriesPayload {
  const name = buildSeriesNameJson(data.languages);
  const languageCodes = Object.keys(name) as LanguageCode[];
  const imageKey = data.image_url.trim();
  return {
    name,
    featured,
    plans: buildSeriesPlansJson(data, languageCodes),
    ...(imageKey ? { image_key: imageKey } : {}),
  };
}

export function buildSeriesCreateBody(
  data: SeriesFormData,
  featured = false,
): SeriesPayload {
  return buildSeriesWriteBody(data, featured);
}

export function buildSeriesUpdateBody(
  data: SeriesFormData,
  featured: boolean,
): SeriesPayload {
  return buildSeriesWriteBody(data, featured);
}
