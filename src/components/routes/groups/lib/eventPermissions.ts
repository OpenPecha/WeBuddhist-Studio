import {
  isReviewer,
  isSuperAdmin,
  type PlatformRole,
} from "@/lib/platformAccess";
import type { AuthorGroupMemberRole } from "@/components/routes/groups/api/groupsApi";

const WRITE_MEMBER_ROLES: AuthorGroupMemberRole[] = [
  "OWNER",
  "ADMIN",
  "AUTHOR",
];

export function canWriteEvents(
  groupRole: AuthorGroupMemberRole | undefined,
  platformRole?: PlatformRole | string,
): boolean {
  if (isReviewer(platformRole)) return false;
  if (isSuperAdmin(platformRole)) return true;
  return groupRole != null && WRITE_MEMBER_ROLES.includes(groupRole);
}

export const canCreateEvent = canWriteEvents;
export const canEditEvent = canWriteEvents;
export const canDeleteEvent = canWriteEvents;
