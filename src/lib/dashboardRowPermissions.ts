import type { AuthorGroupMemberRole } from "@/components/routes/groups/api/groupsApi";
import type { DashboardTableRow } from "@/components/routes/dashboard/dashboardTable";
import type { UserInfo } from "@/hooks/useUserInfo";

/**
 * Resolves group role for a dashboard row from the membership list (`my_role`),
 * not from per-group detail fetches.
 * When the list omits a role, CREATORs with can_create_content get AUTHOR-level
 * edit on DRAFT rows as a safe default (not delete / featured / transfer).
 */
export function resolveDashboardRowGroupRole(
  row: DashboardTableRow,
  rolesByGroupId: Map<string, AuthorGroupMemberRole | undefined>,
  userInfo?: UserInfo | null,
): AuthorGroupMemberRole | undefined {
  if (row.group_id) {
    const fromMap = rolesByGroupId.get(row.group_id);
    if (fromMap) return fromMap;
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
