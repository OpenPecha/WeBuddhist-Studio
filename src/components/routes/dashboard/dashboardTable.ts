import { formatDistanceToNow } from "date-fns";

export type DashboardRowKind = "plan" | "series";

/** Bordered square control for Featured and Actions columns. */
export const DASHBOARD_TABLE_ICON_BTN =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-[#F3F4F6] shadow-none hover:bg-[#E8E8E8] disabled:cursor-not-allowed disabled:opacity-100 dark:border-[#313132] dark:bg-[#2a2a2a] dark:hover:bg-[#333]";

export type DashboardLanguageCode = "EN" | "ZH" | "BO";

export interface DashboardTableRow {
  kind: DashboardRowKind;
  id: string;
  title: string;
  image_url: string;
  languages: DashboardLanguageCode[];
  status: string;
  total_days: number;
  enrolled: number;
  modifiedAt: string | null;
  dateModifiedLabel?: string;
  featured: boolean;
  plans_count?: number;
  group_id?: string | null;
  series_id?: string | null;
}

function normalizeOneLanguageCode(v: string): DashboardLanguageCode | null {
  const u = v.trim().toUpperCase();
  if (u === "EN" || u === "ZH" || u === "BO") return u;
  return null;
}

export function parseDashboardLanguages(raw: unknown): DashboardLanguageCode[] {
  const out: DashboardLanguageCode[] = [];
  const push = (s: string) => {
    const c = normalizeOneLanguageCode(s);
    if (c && !out.includes(c)) out.push(c);
  };
  if (Array.isArray(raw)) {
    for (const item of raw) push(String(item));
  } else if (raw != null && String(raw).trim() !== "") {
    push(String(raw));
  }
  return out;
}

export function formatRowModified(row: DashboardTableRow): string {
  if (row.dateModifiedLabel) return row.dateModifiedLabel;
  if (!row.modifiedAt) return "—";
  const d = new Date(row.modifiedAt);
  if (Number.isNaN(d.getTime())) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

function titleFromMetadataRow(row: Record<string, unknown>): string {
  const title = row.title;
  return typeof title === "string" && title.trim() ? title.trim() : "";
}

export function pickSeriesTitle(
  nameOrTitle: unknown,
  metadata?: unknown,
): string {
  if (Array.isArray(metadata) && metadata.length > 0) {
    const rows = metadata as Record<string, unknown>[];
    const order = ["EN", "BO", "ZH"];
    for (const lang of order) {
      const row = rows.find(
        (r) => String(r.language ?? r.lang ?? "").toUpperCase() === lang,
      );
      const t = row ? titleFromMetadataRow(row) : "";
      if (t) return t;
    }
    for (const row of rows) {
      const t = titleFromMetadataRow(row);
      if (t) return t;
    }
  }
  if (!nameOrTitle) return "Untitled";
  if (typeof nameOrTitle === "string") return nameOrTitle || "Untitled";
  if (typeof nameOrTitle === "object") {
    const o = nameOrTitle as Record<string, unknown>;
    const candidate =
      o.en ||
      o.EN ||
      o.bo ||
      o.BO ||
      o.zh ||
      o.ZH ||
      Object.values(o).find((v) => typeof v === "string");
    return (candidate as string) || "Untitled";
  }
  return "Untitled";
}

export function normalizeStatus(raw: unknown): string {
  let s = String(raw ?? "DRAFT").trim();
  if (s.includes(".")) s = (s.split(".").pop() ?? s).trim();
  return s.toUpperCase();
}

export function mapPlanToTableRow(
  plan: Record<string, unknown>,
): DashboardTableRow {
  const td = plan.total_days;
  const days =
    typeof td === "number" ? td : parseInt(String(td ?? "0"), 10) || 0;
  const sub = plan.subscription_count ?? plan.subscriptionCount ?? "0";
  const enrolled =
    typeof sub === "number" ? sub : parseInt(String(sub), 10) || 0;
  return {
    kind: "plan",
    id: String(plan.id ?? ""),
    title: String(plan.title ?? "Untitled"),
    image_url: String(plan.image_url ?? ""),
    languages: parseDashboardLanguages(
      plan.languages ?? plan.language ?? plan.language_codes,
    ),
    status: normalizeStatus(plan.status),
    total_days: days,
    enrolled,
    modifiedAt:
      (plan.updated_at as string) ??
      (plan.updatedAt as string) ??
      (plan.modified_at as string) ??
      null,
    featured: !!plan.featured,
  };
}

export function mapSeriesToTableRow(
  s: Record<string, unknown>,
): DashboardTableRow {
  const plans = Array.isArray(s.plans)
    ? (s.plans as Record<string, unknown>[])
    : [];
  const firstLang = plans[0]?.language as string | undefined;
  const title =
    typeof s.title === "string" && s.title
      ? s.title
      : pickSeriesTitle(s.name, s.metadata);
  const td = s.total_days ?? 0;
  const days =
    typeof td === "number" ? td : parseInt(String(td ?? "0"), 10) || 0;
  const enrolledRaw = s.enrolled ?? 0;
  const enrolled =
    typeof enrolledRaw === "number"
      ? enrolledRaw
      : parseInt(String(enrolledRaw), 10) || 0;
  return {
    kind: "series",
    id: String(s.id ?? ""),
    title,
    image_url: String(s.image_url ?? s.image ?? ""),
    languages: parseDashboardLanguages(
      s.languages ?? s.language ?? s.language_codes ?? firstLang,
    ),
    status: normalizeStatus(s.status),
    total_days: days,
    enrolled,
    modifiedAt: (s.updated_at as string) ?? (s.updatedAt as string) ?? null,
    featured: !!s.featured,
    plans_count:
      typeof s.plans_count === "number" ? s.plans_count : plans.length,
  };
}

export function isMockDashboardId(id: string) {
  return id.startsWith("mock-");
}
