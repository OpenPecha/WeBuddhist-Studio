import { useQuery } from "@tanstack/react-query";
import {
  fetchAccessibleGroupsForDashboard,
  pickGroupTitle,
  type AuthorGroupListItem,
} from "@/components/routes/groups/api/groupsApi";
import type { PlatformRole } from "@/lib/platformAccess";
import { isReviewer, isSuperAdmin } from "@/lib/platformAccess";

export type DashboardGroupFilterOption = {
  id: string;
  title: string;
};

function toFilterOptions(
  groups: AuthorGroupListItem[],
): DashboardGroupFilterOption[] {
  return groups.map((group) => ({
    id: group.id,
    title: pickGroupTitle(group.metadata),
  }));
}

export function useDashboardGroupFilterOptions(
  platformRole?: PlatformRole | string,
) {
  const staffWideList = isSuperAdmin(platformRole) || isReviewer(platformRole);

  const query = useQuery({
    queryKey: ["dashboard-group-filter", platformRole],
    queryFn: () => fetchAccessibleGroupsForDashboard(platformRole),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const options = toFilterOptions(query.data ?? []);

  return {
    options,
    isLoading: query.isLoading,
    isStaffWideList: staffWideList,
    showFilter: options.length > 0 || staffWideList,
  };
}
