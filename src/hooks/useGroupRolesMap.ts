import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  fetchGroup,
  type AuthorGroupMemberRole,
} from "@/components/routes/groups/api/groupsApi";
import {
  getCurrentUserGroupRole,
  type GroupActor,
} from "@/components/routes/groups/lib/groupPermissions";

/**
 * Sparse fallback: resolve membership role via group detail only for ids
 * that are not already known from the list API (`my_role`).
 */
export function useGroupRolesMap(
  groupIds: (string | null | undefined)[],
  user: GroupActor | undefined,
): Map<string, AuthorGroupMemberRole | undefined> {
  const uniqueIds = useMemo(
    () => [...new Set(groupIds.filter((id): id is string => Boolean(id)))],
    [groupIds],
  );

  const queries = useQueries({
    queries: uniqueIds.map((groupId) => ({
      queryKey: ["cms-group", groupId],
      queryFn: () => fetchGroup(groupId),
      staleTime: 5 * 60 * 1000,
      enabled: Boolean(groupId),
    })),
  });

  return useMemo(() => {
    const map = new Map<string, AuthorGroupMemberRole | undefined>();
    uniqueIds.forEach((groupId, index) => {
      const members = queries[index]?.data?.members ?? [];
      map.set(groupId, getCurrentUserGroupRole(members, user));
    });
    return map;
  }, [uniqueIds, queries, user]);
}
