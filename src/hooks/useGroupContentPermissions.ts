import { useQuery } from "@tanstack/react-query";
import { fetchGroup } from "@/components/routes/groups/api/groupsApi";
import { getEffectiveGroupRole } from "@/components/routes/groups/lib/groupPermissions";
import {
  canChangeContentStatus,
  canDeleteContent,
  canEditContent,
  canInitiateContentTransfer,
  type ContentStatus,
} from "@/lib/contentPermissions";
import { isReviewer, type PlatformRole } from "@/lib/platformAccess";
import { useUserInfo } from "@/hooks/useUserInfo";
import type { AuthorGroupMemberRole } from "@/components/routes/groups/api/groupsApi";

export function useGroupContentPermissions(
  groupId: string | undefined,
  contentStatus: ContentStatus = "DRAFT",
) {
  const { data: userInfo } = useUserInfo();

  const { data: group, isLoading: isGroupLoading } = useQuery({
    queryKey: ["cms-group", groupId],
    queryFn: () => fetchGroup(groupId!),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: false,
  });

  const groupRole: AuthorGroupMemberRole | undefined = group
    ? getEffectiveGroupRole(group.members ?? [], userInfo)
    : undefined;

  const platformRole = userInfo?.platform_role as PlatformRole | undefined;
  const platformReadOnly = isReviewer(platformRole);

  return {
    userInfo,
    group,
    groupRole,
    platformRole,
    platformReadOnly,
    isGroupLoading,
    canEdit: canEditContent(groupRole, contentStatus, platformRole),
    canChangeStatus: canChangeContentStatus(groupRole, platformRole),
    canDelete: canDeleteContent(groupRole, contentStatus, platformRole),
    canTransfer: canInitiateContentTransfer(groupRole, platformRole),
  };
}
