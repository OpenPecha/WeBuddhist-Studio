import axiosInstance from "@/config/axios-config";
import type {
  LanguageCode,
  SeriesFormData,
  SeriesPlan,
} from "@/schema/SeriesSchema";

export type SeriesMetadataInput = {
  title: string;
  description: string;
  language: LanguageCode;
};

export type SeriesPayload = {
  metadata: SeriesMetadataInput[];
  image_key?: string;
  featured: boolean;
  plans: Partial<Record<LanguageCode, string[]>>;
  group_id?: string;
};

export type SeriesUpdatePayload = Partial<SeriesPayload>;

export type SeriesPlanDTO = {
  id: string;
  title: string;
  description?: string | null;
  language: string;
  image_url?: string | null;
  image_key?: string | null;
  display_order?: number | null;
  total_days?: number | null;
  status?: string;
  featured?: boolean;
  enrolled_count?: number | null;
  subscription_count?: number | null;
  updated_at?: string | null;
};

export type SeriesMetadataDTO = {
  id?: string;
  language?: string;
  lang?: string;
  title?: string;
  description?: string;
};

export type SeriesDetailDTO = {
  id: string;
  name?: Record<string, unknown>;
  metadata?: SeriesMetadataDTO[];
  image?: string | null;
  image_key?: string | null;
  author_id?: string;
  group_id?: string | null;
  featured: boolean;
  status: string;
  plans: SeriesPlanDTO[];
  total_days?: number;
};

export const getSeries = async (seriesId: string): Promise<SeriesDetailDTO> => {
  const { data } = await axiosInstance.get<SeriesDetailDTO>(
    `/api/v1/cms/series/${seriesId}`,
  );
  return data;
};

export const postSeries = async (body: SeriesPayload) => {
  const { data } = await axiosInstance.post<SeriesDetailDTO>(
    `/api/v1/cms/series`,
    body,
  );
  return data;
};

export const putUpdateSeries = async ({
  seriesId,
  body,
}: {
  seriesId: string;
  body: SeriesPayload | SeriesUpdatePayload;
}) => {
  const { data } = await axiosInstance.put<SeriesDetailDTO>(
    `/api/v1/cms/series/${seriesId}`,
    body,
  );
  return data;
};

export const putSeriesFeatured = async (
  seriesId: string,
  featured: boolean,
) => {
  return putUpdateSeries({ seriesId, body: { featured } });
};

function normalizeLang(raw: string): LanguageCode | null {
  const u = raw.trim().toUpperCase();
  if (u === "EN" || u === "BO" || u === "ZH") return u;
  return null;
}

function parseNameObject(
  name: Record<string, unknown>,
): SeriesFormData["languages"] {
  const languages: SeriesFormData["languages"] = {};
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
  return languages;
}

function parseMetadataArray(
  metadata: SeriesMetadataDTO[],
): SeriesFormData["languages"] {
  const languages: SeriesFormData["languages"] = {};
  for (const row of metadata) {
    const code = normalizeLang(String(row.language ?? row.lang ?? ""));
    if (!code) continue;
    languages[code] = {
      title: String(row.title ?? "").trim(),
      description: String(row.description ?? "").trim(),
    };
  }
  return languages;
}

/** Infer language tabs from attached plans when name/metadata are empty. */
function languagesFromPlans(
  plans: SeriesPlanDTO[],
): SeriesFormData["languages"] {
  const languages: SeriesFormData["languages"] = {};
  const seen = new Set<LanguageCode>();
  for (const p of plans) {
    const code = normalizeLang(p.language);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    languages[code] = { title: "", description: "" };
  }
  return languages;
}

function resolveSeriesLanguages(
  dto: SeriesDetailDTO,
): SeriesFormData["languages"] {
  if (dto.name && Object.keys(dto.name).length > 0) {
    return parseNameObject(dto.name);
  }
  if (Array.isArray(dto.metadata) && dto.metadata.length > 0) {
    return parseMetadataArray(dto.metadata);
  }
  return languagesFromPlans(dto.plans ?? []);
}

function resolveSeriesImageKey(dto: SeriesDetailDTO): string {
  if (dto.image_key?.trim()) return dto.image_key.trim();
  if (dto.image && !/^https?:\/\//i.test(dto.image)) return dto.image.trim();
  return "";
}

export function mapSeriesDetailToFormData(
  dto: SeriesDetailDTO,
): SeriesFormData {
  const languages = resolveSeriesLanguages(dto);

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

  const order: LanguageCode[] = ["EN", "BO", "ZH"];
  const plans: SeriesFormData["plans"] = {};
  for (const code of order) {
    const row = buckets[code];
    if (!row?.length) continue;
    plans[code] = [...row].sort((a, b) => a.ord - b.ord).map((x) => x.item);
  }

  return {
    languages,
    plans,
    image_url: resolveSeriesImageKey(dto),
  };
}

export function buildSeriesMetadata(
  languages: SeriesFormData["languages"],
): SeriesMetadataInput[] {
  const order: LanguageCode[] = ["EN", "BO", "ZH"];
  const out: SeriesMetadataInput[] = [];
  for (const code of order) {
    const block = languages[code];
    if (!block) continue;
    out.push({
      language: code,
      title: block.title.trim(),
      description: block.description.trim(),
    });
  }
  return out;
}

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
  groupId?: string,
): SeriesPayload {
  const metadata = buildSeriesMetadata(data.languages);
  const languageCodes = metadata.map((m) => m.language);
  const imageKey = data.image_url.trim();
  return {
    metadata,
    featured,
    plans: buildSeriesPlansJson(data, languageCodes),
    ...(imageKey ? { image_key: imageKey } : {}),
    ...(groupId ? { group_id: groupId } : {}),
  };
}

export function buildSeriesCreateBody(
  data: SeriesFormData,
  featured = false,
  groupId?: string,
): SeriesPayload {
  return buildSeriesWriteBody(data, featured, groupId);
}

export function buildSeriesUpdateBody(
  data: SeriesFormData,
  featured: boolean,
  groupId?: string,
): SeriesPayload {
  return buildSeriesWriteBody(data, featured, groupId);
}

export function buildSeriesPlansPayloadFromIds(
  plansByLang: Partial<Record<LanguageCode, string[]>>,
): Partial<Record<LanguageCode, string[]>> {
  const order: LanguageCode[] = ["EN", "BO", "ZH"];
  const out: Partial<Record<LanguageCode, string[]>> = {};
  for (const code of order) {
    const ids = plansByLang[code];
    if (ids?.length) out[code] = ids;
  }
  return out;
}

export async function putSeriesPlans(
  seriesId: string,
  plansByLang: Partial<Record<LanguageCode, string[]>>,
) {
  return putUpdateSeries({
    seriesId,
    body: { plans: buildSeriesPlansPayloadFromIds(plansByLang) },
  });
}

export type SeriesListItemDTO = {
  id: string;
  metadata?: SeriesMetadataDTO[];
  image?: string | null;
  image_key?: string | null;
  author_id?: string;
  featured?: boolean;
  status?: string;
  plan_count?: number;
  total_days?: number;
};

export type SeriesListResponse = {
  series: SeriesListItemDTO[];
};

export type SeriesOption = {
  id: string;
  title: string;
};

function resolveSeriesListTitle(metadata?: SeriesMetadataDTO[]): string {
  if (!Array.isArray(metadata) || metadata.length === 0) return "Untitled";
  const order = ["EN", "BO", "ZH"];
  for (const lang of order) {
    const row = metadata.find(
      (r) => String(r.language ?? r.lang ?? "").toUpperCase() === lang,
    );
    const t = row?.title?.trim();
    if (t) return t;
  }
  for (const row of metadata) {
    const t = row.title?.trim();
    if (t) return t;
  }
  return "Untitled";
}

export const fetchSeriesList = async (): Promise<SeriesOption[]> => {
  const { data } = await axiosInstance.get<SeriesListResponse>(
    `/api/v1/cms/series`,
    { params: { limit: 100 } },
  );
  return (data?.series ?? []).map((s) => ({
    id: s.id,
    title: resolveSeriesListTitle(s.metadata),
  }));
};
