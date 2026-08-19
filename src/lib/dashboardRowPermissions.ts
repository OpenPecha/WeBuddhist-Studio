import type { AuthorGroupMemberRole } from "@/components/routes/groups/api/groupsApi";
import type { DashboardTableRow } from "@/components/routes/dashboard/dashboardTable";
import type { UserInfo } from "@/hooks/useUserInfo";

/**
 * Resolves group role for a dashboard row.
 * Prefer `my_role` / sparse membership map. Do not invent OWNER/ADMIN.
 * When group_id is missing, CREATORs with can_create_content get AUTHOR on
 * DRAFT only (edit, not delete / featured / transfer).
 */
export function resolveDashboardRowGroupRole(
  row: DashboardTableRow,
  rolesByGroupId: Map<string, AuthorGroupMemberRole | undefined>,
  userInfo?: UserInfo | null,
): AuthorGroupMemberRole | undefined {
  if (row.group_id) {
    return rolesByGroupId.get(row.group_id);
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
