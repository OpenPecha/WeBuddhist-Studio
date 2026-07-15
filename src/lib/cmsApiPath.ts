/** Normalize CMS paths from notifications (e.g. `/cms/...`) for axios (`/api/v1/cms/...`). */
export function resolveCmsApiPath(path: string): string {
  const trimmed = path.trim();
  if (trimmed.startsWith("/api/v1")) return trimmed;
  if (trimmed.startsWith("/cms")) return `/api/v1${trimmed}`;
  if (trimmed.startsWith("cms/")) return `/api/v1/${trimmed}`;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
