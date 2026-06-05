import type {
  SeriesMetadataDTO,
  SeriesPlanDTO,
} from "@/components/routes/create-series/api/seriesApi";
import type { LanguageCode } from "@/schema/SeriesSchema";
import {
  normalizeStatus,
  resolveDashboardItemImageUrl,
  type DashboardItemImageFields,
} from "@/components/routes/dashboard/dashboardTable";
import type { Plan } from "@/components/routes/create-series/api/planSearchApi";
import type { SeriesPlan } from "@/schema/SeriesSchema";
import type { PlansByLanguage, SeriesPlanRow } from "./seriesDetailsTypes";

const LANG_ORDER: LanguageCode[] = ["EN", "BO", "ZH"];

function normalizeLang(raw: string): LanguageCode | null {
  const u = raw.trim().toUpperCase();
  if (u === "EN" || u === "BO" || u === "ZH") return u;
  return null;
}

export function mapPlanDtoToRow(plan: SeriesPlanDTO): SeriesPlanRow | null {
  const language = normalizeLang(plan.language);
  if (!language) return null;
  const enrolledRaw = plan.enrolled_count ?? plan.subscription_count ?? 0;
  const enrolled =
    typeof enrolledRaw === "number"
      ? enrolledRaw
      : parseInt(String(enrolledRaw), 10) || 0;
  const td = plan.total_days ?? 0;
  const total_days =
    typeof td === "number" ? td : parseInt(String(td ?? "0"), 10) || 0;
  const mappedImageUrl = resolveDashboardItemImageUrl(
    plan as DashboardItemImageFields,
  );
  return {
    id: String(plan.id),
    title: plan.title,
    image_url: mappedImageUrl,
    language,
    status: normalizeStatus(plan.status),
    total_days,
    enrolled,
    modifiedAt: plan.updated_at ?? null,
    featured: !!plan.featured,
  };
}

export function mapSearchPlanToRow(plan: Plan): SeriesPlanRow | null {
  const language = normalizeLang(plan.language);
  if (!language) return null;
  return {
    id: plan.id,
    title: plan.title,
    image_url: resolveDashboardItemImageUrl({
      image_url: plan.image_url,
      image_key: plan.image_key,
    }),
    language,
    status: normalizeStatus(plan.status),
    total_days: plan.total_days ?? 0,
    enrolled: plan.subscription_count ?? 0,
    modifiedAt: null,
    featured: !!plan.featured,
  };
}

export function groupPlansByLanguage(plans: SeriesPlanDTO[]): PlansByLanguage {
  const buckets: Partial<
    Record<LanguageCode, { row: SeriesPlanRow; ord: number }[]>
  > = {};
  for (const p of plans) {
    const row = mapPlanDtoToRow(p);
    if (!row) continue;
    const ord =
      typeof p.display_order === "number" && !Number.isNaN(p.display_order)
        ? p.display_order
        : 1_000_000;
    if (!buckets[row.language]) buckets[row.language] = [];
    buckets[row.language]!.push({ row, ord });
  }
  const out: PlansByLanguage = {};
  for (const code of LANG_ORDER) {
    const list = buckets[code];
    if (!list?.length) continue;
    out[code] = [...list].sort((a, b) => a.ord - b.ord).map((x) => x.row);
  }
  return out;
}

export function plansByLanguageToIdMap(
  grouped: PlansByLanguage,
): Partial<Record<LanguageCode, string[]>> {
  const out: Partial<Record<LanguageCode, string[]>> = {};
  for (const code of LANG_ORDER) {
    const rows = grouped[code];
    if (rows?.length) out[code] = rows.map((r) => r.id);
  }
  return out;
}

export function getLanguageTabCounts(
  grouped: PlansByLanguage,
): Record<LanguageCode, number> {
  return {
    EN: grouped.EN?.length ?? 0,
    BO: grouped.BO?.length ?? 0,
    ZH: grouped.ZH?.length ?? 0,
  };
}

export function getSeriesTitleForLanguage(
  metadata: SeriesMetadataDTO[] | undefined,
  language: LanguageCode,
  fallback = "Untitled series",
): string {
  if (!metadata?.length) return fallback;
  const row = metadata.find(
    (m) => normalizeLang(String(m.language ?? m.lang ?? "")) === language,
  );
  const title = row?.title?.trim();
  if (title) return title;
  const en = metadata.find(
    (m) => normalizeLang(String(m.language ?? m.lang ?? "")) === "EN",
  );
  if (en?.title?.trim()) return en.title.trim();
  return metadata[0]?.title?.trim() || fallback;
}

export function reorderPlansInLanguage(
  grouped: PlansByLanguage,
  language: LanguageCode,
  activeId: string,
  overId: string,
): PlansByLanguage {
  const list = [...(grouped[language] ?? [])];
  const from = list.findIndex((p) => p.id === activeId);
  const to = list.findIndex((p) => p.id === overId);
  if (from < 0 || to < 0 || from === to) return grouped;
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
  return { ...grouped, [language]: list };
}

export function attachPlanToLanguage(
  grouped: PlansByLanguage,
  language: LanguageCode,
  plan: SeriesPlanRow,
): PlansByLanguage {
  const list = grouped[language] ?? [];
  if (list.some((p) => p.id === plan.id)) return grouped;
  return { ...grouped, [language]: [...list, plan] };
}

export function seriesPlanRowsToSeriesPlans(
  rows: SeriesPlanRow[],
): SeriesPlan[] {
  return rows.map(({ id, title, image_url }) => ({
    id,
    title,
    image_url: image_url || undefined,
  }));
}

export function seriesPlansToRows(
  plans: SeriesPlan[],
  language: LanguageCode,
  existing: SeriesPlanRow[],
): SeriesPlanRow[] {
  return plans.map((sp) => {
    const prev = existing.find((p) => p.id === sp.id);
    if (prev) return prev;
    return {
      id: sp.id,
      title: sp.title,
      image_url: sp.image_url ?? "",
      language,
      status: "DRAFT",
      total_days: 0,
      enrolled: 0,
      modifiedAt: null,
      featured: false,
    };
  });
}

export function removePlanFromLanguage(
  grouped: PlansByLanguage,
  language: LanguageCode,
  planId: string,
): PlansByLanguage {
  const list = grouped[language] ?? [];
  return { ...grouped, [language]: list.filter((p) => p.id !== planId) };
}
