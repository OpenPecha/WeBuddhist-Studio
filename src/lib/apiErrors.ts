import {
  AUTHOR_NOT_ACTIVE_DETAIL,
  isAuthorNotActiveDetail,
} from "@/lib/platformAccess";

export function getApiErrorDetail(error: unknown): string | undefined {
  const err = error as { response?: { data?: { detail?: unknown } } };
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (
    detail &&
    typeof detail === "object" &&
    "message" in detail &&
    typeof (detail as { message: string }).message === "string"
  ) {
    return (detail as { message: string }).message;
  }
  return undefined;
}

/**
 * True for failures that do not indicate the request itself was rejected:
 * network errors/timeouts (no HTTP response), HTTP 408/429, and 5xx server
 * errors. These are safe to retry with the same payload.
 */
export function isTransientApiError(error: unknown): boolean {
  const err = error as { response?: { status?: number } } | null;
  if (!err || typeof err !== "object") return true;
  if (!err.response) return true;
  const status = err.response.status;
  return (
    typeof status === "number" &&
    (status === 408 || status === 429 || status >= 500)
  );
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  [AUTHOR_NOT_ACTIVE_DETAIL]: AUTHOR_NOT_ACTIVE_DETAIL,
  CONTENT_PUBLISHED_READ_ONLY:
    "Published content is read-only for your role in this group.",
  STATUS_CHANGE_FORBIDDEN:
    "You cannot change the status of this content with your current role.",
  NO_GROUP_MEMBERSHIP: "You are not a member of this content's group.",
  "Target group must differ from the current group":
    "Choose a different group than the content's current group.",
  "Target group not found": "That group could not be found.",
  "A pending transfer request already exists for this content":
    "A transfer request is already pending for this content.",
  "Plan is attached to a series; transfer the series or detach the plan first":
    "Transfer the series instead, or detach the plan from the series first.",
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  const detail = getApiErrorDetail(error);
  if (detail) {
    if (FRIENDLY_MESSAGES[detail]) return FRIENDLY_MESSAGES[detail];
    if (isAuthorNotActiveDetail(detail)) return AUTHOR_NOT_ACTIVE_DETAIL;
    return detail;
  }
  const err = error as { response?: { data?: { detail?: unknown } } };
  const rawDetail = err?.response?.data?.detail;
  if (Array.isArray(rawDetail) && rawDetail[0]?.msg) return rawDetail[0].msg;
  return fallback;
}
