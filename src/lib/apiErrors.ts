export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  const err = error as { response?: { data?: { detail?: unknown } } };
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (
    detail &&
    typeof detail === "object" &&
    "message" in detail &&
    typeof (detail as { message: string }).message === "string"
  ) {
    return (detail as { message: string }).message;
  }
  return fallback;
}
