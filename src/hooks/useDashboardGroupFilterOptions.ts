import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAccessibleGroupsForDashboard,
  pickGroupTitle,
  type AuthorGroupListItem,
} from "@/components/routes/groups/api/groupsApi";
import type { UserInfo } from "@/hooks/useUserInfo";
import { useGroupRolesMap } from "@/hooks/useGroupRolesMap";
import {
  canUseDashboardGroupFilter,
  usesStaffWideDashboardGroupList,
} from "@/lib/platformAccess";

export type DashboardGroupFilterOption = {
  id: string;
  title: string;
  /** Dropdown label (includes membership role for creators when known). */
  label: string;
};

function toFilterOptions(
  groups: AuthorGroupListItem[],
  rolesByGroupId: Map<string, string | undefined>,
  showMemberRole: boolean,
): DashboardGroupFilterOption[] {
  return groups.map((group) => {
    const title = pickGroupTitle(group.metadata);
    const role = rolesByGroupId.get(group.id);
    const label = showMemberRole && role ? `${title} (${role})` : title;
    return { id: group.id, title, label };
  });
}

export function useDashboardGroupFilterOptions(userInfo?: UserInfo | null) {
  const platformRole = userInfo?.platform_role;
  const isStaffWideList = usesStaffWideDashboardGroupList(platformRole);
  const canLoad = canUseDashboardGroupFilter(userInfo);

  const query = useQuery({
    queryKey: ["dashboard-group-filter", platformRole, userInfo?.has_group],
    queryFn: () => fetchAccessibleGroupsForDashboard(userInfo),
    enabled: canLoad,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const groupIds = useMemo(
    () => (query.data ?? []).map((g) => g.id),
    [query.data],
  );

  const userActor = userInfo
    ? {
        id: userInfo.id,
        email: userInfo.email,
        platform_role: userInfo.platform_role,
      }
    : undefined;

  const memberRolesByGroupId = useGroupRolesMap(
    isStaffWideList ? [] : groupIds,
    userActor,
  );

  const roleLabels = useMemo(() => {
    const map = new Map<string, string | undefined>();
    memberRolesByGroupId.forEach((role, id) => {
      if (role) map.set(id, role);
    });
    return map;
  }, [memberRolesByGroupId]);

  const options = useMemo(
    () => toFilterOptions(query.data ?? [], roleLabels, !isStaffWideList),
    [query.data, roleLabels, isStaffWideList],
  );

  return {
    options,
    isLoading: query.isLoading,
    isStaffWideList,
    showFilter: canLoad && (options.length > 0 || isStaffWideList),
    /** Creators: only group_ids returned from the membership list API. */
    allowedGroupIds: useMemo(
      () => new Set(options.map((g) => g.id)),
      [options],
    ),
  };
}
