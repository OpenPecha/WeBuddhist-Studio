import type { PlatformRole } from "@/lib/platformAccess";
import { isSuperAdmin } from "@/lib/platformAccess";
import type { AuthorGroupMemberRole } from "@/components/routes/groups/api/groupsApi";

export type ContentStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "ARCHIVED"
  | string;

export function canEditContent(
  groupRole: AuthorGroupMemberRole | undefined,
  status: ContentStatus,
  platformRole?: PlatformRole | string,
): boolean {
  if (isSuperAdmin(platformRole)) return true;
  if (!groupRole || groupRole === "VIEWER") return false;
  if (groupRole === "AUTHOR") {
    return status === "DRAFT";
  }
  if (groupRole === "OWNER" || groupRole === "ADMIN") return true;
  return false;
}

export function canChangeContentStatus(
  groupRole: AuthorGroupMemberRole | undefined,
  platformRole?: PlatformRole | string,
): boolean {
  if (isSuperAdmin(platformRole)) return true;
  return groupRole === "OWNER" || groupRole === "ADMIN";
}

/** Only OWNER, ADMIN, or SUPER_ADMIN may delete group content (never group AUTHOR). */
export function canDeleteContent(
  groupRole: AuthorGroupMemberRole | undefined,
  status: ContentStatus,
  platformRole?: PlatformRole | string,
): boolean {
  if (isSuperAdmin(platformRole)) {
    return (
      status === "DRAFT" || status === "ARCHIVED" || status === "UNPUBLISHED"
    );
  }
  if (!groupRole || groupRole === "VIEWER" || groupRole === "AUTHOR") {
    return false;
  }
  if (groupRole === "OWNER" || groupRole === "ADMIN") {
    return status === "DRAFT" || status === "ARCHIVED";
  }
  return false;
}

export function canInitiateContentTransfer(
  groupRole: AuthorGroupMemberRole | undefined,
  platformRole?: PlatformRole | string,
): boolean {
  if (isSuperAdmin(platformRole)) return true;
  return groupRole === "OWNER" || groupRole === "ADMIN";
}
