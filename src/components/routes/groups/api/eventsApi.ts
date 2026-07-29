import axiosInstance from "@/config/axios-config";
import { uploadImageToS3 } from "@/components/routes/task/api/taskApi";
import { makeLinkedContentSearchFn } from "@/components/routes/groups/api/groupPickerApi";
import { searchAccumulatorPresets } from "@/components/routes/groups/api/accumulatorPresetSearchApi";
import { fetchChantCollection } from "@/components/routes/groups/api/chantsApi";
import type { FkOption } from "@/components/routes/groups/components/FkMultiSearchSelector";
import type {
  EventFormData,
  EventLinkRow,
  EventMetadataRow,
  LanguageCode,
} from "@/schema/EventSchema";
import {
  LANGUAGE_CODE_ORDER,
  normalizeLanguageCode,
} from "@/lib/languageCodes";

export interface ImageUrlModel {
  thumbnail: string;
  medium: string;
  original: string;
}

export interface EventMetadataDTO {
  id: string;
  name: string;
  description?: string;
  language: string;
}

export type EventMetadataResponse =
  | EventMetadataDTO
  | EventMetadataDTO[]
  | null;

export interface EventLinkDTO {
  id: string;
  type: string;
  url: string;
  label?: string;
  display_order: number;
}

export interface EventDTO {
  id: string;
  group_id: string;
  plan_id?: string;
  series_id?: string;
  accumulator_id?: string;
  group_recitation_collection_id?: string;
  start_date: string;
  end_date: string;
  is_one_day: boolean;
  metadata: EventMetadataResponse;
  links?: EventLinkDTO[];
  image?: ImageUrlModel;
  image_url?: string;
  participant_count?: number;
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export interface EventsResponse {
  events: EventDTO[];
  total: number;
  skip: number;
  limit: number;
}

export interface EventMetadataInput {
  name: string;
  description?: string;
  language: LanguageCode;
}

export interface EventLinkInput {
  type: string;
  url: string;
  label?: string;
  display_order: number;
}

export interface CreateEventRequest {
  group_id: string;
  start_date: string;
  end_date: string;
  metadata: EventMetadataInput[];
  links?: EventLinkInput[];
  image_url?: string;
  plan_id?: string;
  series_id?: string;
  accumulator_id?: string;
  group_recitation_collection_id?: string;
}

export interface UpdateEventRequest {
  group_id?: string;
  start_date?: string;
  end_date?: string;
  metadata?: EventMetadataInput[];
  links?: EventLinkInput[];
  image_url?: string;
  plan_id?: string;
  series_id?: string;
  accumulator_id?: string;
  group_recitation_collection_id?: string | null;
}

export interface EventListFilters {
  group_id?: string;
  plan_id?: string;
  accumulator_id?: string;
  group_recitation_collection_id?: string;
  from_date?: string;
  to_date?: string;
  language?: string;
  skip?: number;
  limit?: number;
}

export const fetchCmsEvents = async (
  filters: EventListFilters = {},
): Promise<EventsResponse> => {
  const { data } = await axiosInstance.get<EventsResponse>(
    `/api/v1/cms/events`,
    { params: filters },
  );
  return data;
};

export const fetchCmsEvent = async (
  eventId: string,
  language?: string,
): Promise<EventDTO> => {
  const { data } = await axiosInstance.get<EventDTO>(
    `/api/v1/cms/events/${eventId}`,
    { params: language ? { language } : undefined },
  );
  return data;
};

export const createCmsEvent = async (
  body: CreateEventRequest,
): Promise<EventDTO> => {
  const { data } = await axiosInstance.post<EventDTO>(
    `/api/v1/cms/events`,
    body,
  );
  return data;
};

export const updateCmsEvent = async (
  eventId: string,
  body: UpdateEventRequest,
): Promise<EventDTO> => {
  const { data } = await axiosInstance.put<EventDTO>(
    `/api/v1/cms/events/${eventId}`,
    body,
  );
  return data;
};

export const deleteCmsEvent = async (eventId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/cms/events/${eventId}`);
};

export const uploadEventImage = async (file: File): Promise<string> => {
  const { key } = await uploadImageToS3(file, "");
  return key;
};

export function metadataArray(m: EventMetadataResponse): EventMetadataDTO[] {
  if (!m) return [];
  return Array.isArray(m) ? m : [m];
}

export function eventName(
  event: Pick<EventDTO, "metadata">,
  preferred: LanguageCode = "EN",
): string {
  const arr = metadataArray(event.metadata);
  return (
    arr.find((e) => e.language.toUpperCase() === preferred)?.name ??
    arr[0]?.name ??
    "Untitled event"
  );
}

const LANGUAGE_ORDER = LANGUAGE_CODE_ORDER;

export function mapEventToFormData(event: EventDTO): EventFormData {
  const rows = metadataArray(event.metadata)
    .map((m) => {
      const language = normalizeLanguageCode(m.language);
      if (!language) return null;
      return {
        language,
        name: m.name?.trim() ?? "",
        description: m.description?.trim() ?? "",
      } satisfies EventMetadataRow;
    })
    .filter((r): r is EventMetadataRow => r != null)
    .sort((a, b) => {
      const ai = LANGUAGE_ORDER.indexOf(a.language);
      const bi = LANGUAGE_ORDER.indexOf(b.language);
      const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
      const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
      if (aRank !== bRank) return aRank - bRank;
      return a.language.localeCompare(b.language);
    });

  const links = [...(event.links ?? [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map(
      (link): EventLinkRow => ({
        type: link.type?.trim() ?? "",
        url: link.url?.trim() ?? "",
        label: link.label?.trim() ?? "",
      }),
    );

  return {
    start_date: event.start_date ?? "",
    end_date: event.end_date ?? "",
    is_one_day: Boolean(event.is_one_day),
    metadata:
      rows.length > 0 ? rows : [{ language: "EN", name: "", description: "" }],
    links,
    image_url: event.image_url?.trim() ?? "",
    plan_id: event.plan_id?.trim() ?? "",
    series_id: event.series_id?.trim() ?? "",
    accumulator_id: event.accumulator_id?.trim() ?? "",
    group_recitation_collection_id:
      event.group_recitation_collection_id?.trim() ?? "",
  };
}

function buildLinksInput(rows: EventLinkRow[]): EventLinkInput[] {
  return rows.map((row, index) => {
    const label = row.label.trim();
    return {
      type: row.type.trim(),
      url: row.url.trim(),
      display_order: index + 1,
      ...(label ? { label } : {}),
    };
  });
}

function linksEqual(a: EventLinkRow[], b: EventLinkRow[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].type.trim() !== b[i].type.trim()) return false;
    if (a[i].url.trim() !== b[i].url.trim()) return false;
    if (a[i].label.trim() !== b[i].label.trim()) return false;
  }
  return true;
}

function buildMetadataInput(rows: EventMetadataRow[]): EventMetadataInput[] {
  return rows.map((row) => {
    const description = row.description.trim();
    return {
      language: row.language,
      name: row.name.trim(),
      ...(description ? { description } : {}),
    };
  });
}

export function buildCreateEventBody(
  data: EventFormData,
  groupId: string,
): CreateEventRequest {
  const imageUrl = data.image_url.trim();
  const planId = data.plan_id.trim();
  const seriesId = data.series_id.trim();
  const accumulatorId = data.accumulator_id.trim();
  const chantCollectionId = data.group_recitation_collection_id.trim();
  return {
    group_id: groupId,
    start_date: data.start_date,
    end_date: data.end_date,
    metadata: buildMetadataInput(data.metadata),
    ...(data.links.length ? { links: buildLinksInput(data.links) } : {}),
    ...(imageUrl ? { image_url: imageUrl } : {}),
    ...(planId ? { plan_id: planId } : {}),
    ...(seriesId ? { series_id: seriesId } : {}),
    ...(accumulatorId ? { accumulator_id: accumulatorId } : {}),
    ...(chantCollectionId
      ? { group_recitation_collection_id: chantCollectionId }
      : {}),
  };
}

async function resolveLinkOption(
  id: string,
  fallbackLabel: string,
  searchFn: (params: {
    search?: string;
    skip?: number;
    limit?: number;
  }) => Promise<{
    items: FkOption[];
    skip: number;
    limit: number;
    total: number;
  }>,
  fallbackKind?: "plan" | "series",
): Promise<FkOption> {
  const PAGE = 20;
  const MAX_PAGES = 5;
  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await searchFn({ skip: page * PAGE, limit: PAGE });
      const match = res.items.find((item) => item.id === id);
      if (match) return match;
      const fetched = res.skip + res.items.length;
      if (fetched >= res.total || res.items.length === 0) break;
    }
  } catch {}
  return {
    id,
    title: fallbackLabel,
    ...(fallbackKind ? { kind: fallbackKind } : {}),
  };
}

export function resolveLinkedContent(
  groupId: string,
  id: string,
  kind: "plan" | "series",
): Promise<FkOption> {
  const fallback = kind === "series" ? "Linked series" : "Linked plan";
  return resolveLinkOption(
    id,
    fallback,
    makeLinkedContentSearchFn(groupId),
    kind,
  );
}

export function resolveLinkedAccumulator(id: string): Promise<FkOption> {
  return resolveLinkOption(id, "Linked accumulator", searchAccumulatorPresets);
}

export async function resolveLinkedChantCollection(
  groupId: string,
  id: string,
): Promise<FkOption> {
  try {
    const collection = await fetchChantCollection(groupId, id);
    return {
      id: collection.id,
      title: collection.name?.trim() || "Linked chant collection",
      ...(collection.img_url ? { image_url: collection.img_url } : {}),
    };
  } catch {
    return { id, title: "Linked chant collection" };
  }
}

function metadataEqual(a: EventMetadataRow[], b: EventMetadataRow[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].language !== b[i].language) return false;
    if (a[i].name.trim() !== b[i].name.trim()) return false;
    if (a[i].description.trim() !== b[i].description.trim()) return false;
  }
  return true;
}

export function buildUpdateEventBody(
  data: EventFormData,
  original: EventFormData,
): UpdateEventRequest {
  const body: UpdateEventRequest = {};

  if (data.start_date !== original.start_date)
    body.start_date = data.start_date;
  if (data.end_date !== original.end_date) body.end_date = data.end_date;

  if (!metadataEqual(data.metadata, original.metadata)) {
    body.metadata = buildMetadataInput(data.metadata);
  }

  if (!linksEqual(data.links, original.links)) {
    body.links = buildLinksInput(data.links);
  }

  const scalarKeys: (keyof Pick<
    EventFormData,
    "image_url" | "plan_id" | "series_id" | "accumulator_id"
  >)[] = ["image_url", "plan_id", "series_id", "accumulator_id"];
  for (const key of scalarKeys) {
    const next = data[key].trim();
    const prev = original[key].trim();
    if (next !== prev) body[key] = next;
  }

  const nextChant = data.group_recitation_collection_id.trim();
  const prevChant = original.group_recitation_collection_id.trim();
  if (nextChant !== prevChant) {
    body.group_recitation_collection_id = nextChant || null;
  }

  return body;
}
