import type { AuthorGroupMemberRole } from "@/components/routes/groups/api/groupsApi";
import type { DashboardTableRow } from "@/components/routes/dashboard/dashboardTable";
import type { UserInfo } from "@/hooks/useUserInfo";
import { isSuperAdmin } from "@/lib/platformAccess";

/**
 * Resolves group role for a dashboard row.
 * When the list API omits group_id, enrichment may still fail — CREATORs with
 * can_create_content get AUTHOR-level edit on DRAFT rows as a safe default (not delete).
 */
export function resolveDashboardRowGroupRole(
  row: DashboardTableRow,
  groupRolesByGroupId:
    | Map<string, AuthorGroupMemberRole | undefined>
    | undefined,
  userInfo?: UserInfo | null,
): AuthorGroupMemberRole | undefined {
  if (isSuperAdmin(userInfo?.platform_role)) {
    return groupRolesByGroupId?.get(row.group_id ?? "") ?? "OWNER";
  }

  if (row.group_id) {
    const role = groupRolesByGroupId?.get(row.group_id);
    if (role) return role;
    if (userInfo?.can_create_content && userInfo.platform_role === "CREATOR") {
      return "AUTHOR";
    }
  }

  if (
    userInfo?.can_create_content &&
    userInfo.platform_role === "CREATOR" &&
    row.status === "DRAFT"
  ) {
    return "AUTHOR";
  }

  return undefined;
}
