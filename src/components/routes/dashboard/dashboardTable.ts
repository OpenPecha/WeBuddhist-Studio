import { formatDistanceToNow } from "date-fns";

export type DashboardRowKind = "plan" | "series";

export type DashboardLanguageCode = "EN" | "ZH" | "BO";

export interface DashboardTableRow {
  kind: DashboardRowKind;
  id: string;
  title: string;
  image_url: string;
  /** One or more content languages (order preserved). */
  languages: DashboardLanguageCode[];
  status: string;
  total_days: number;
  enrolled: number;
  modifiedAt: string | null;
  /** When set (e.g. mock unified feed), shown instead of formatting {@link modifiedAt}. */
  dateModifiedLabel?: string;
  featured: boolean;
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

export function pickSeriesTitle(name: unknown): string {
  if (!name) return "Untitled";
  if (typeof name === "string") return name || "Untitled";
  if (typeof name === "object") {
    const o = name as Record<string, unknown>;
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
  const s = String(raw ?? "DRAFT");
  if (s.includes(".")) return s.split(".").pop() || "DRAFT";
  return s;
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
    typeof s.title === "string" && s.title ? s.title : pickSeriesTitle(s.name);
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
  };
}

export function isMockDashboardId(id: string) {
  return id.startsWith("mock-");
}
