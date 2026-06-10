import { useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoMdCreate } from "react-icons/io";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { useUserInfo } from "@/hooks/useUserInfo";
import { ROUTES } from "@/routes/paths";
import { isReviewer } from "@/lib/platformAccess";
import {
  canEditGroupSettings,
  canManageGroupInvites,
  getEffectiveGroupRole,
} from "./lib/groupPermissions";
import type { LanguageCode } from "@/schema/SeriesSchema";
import {
  fetchGroup,
  languageLabelForCode,
  pickGroupTitle,
  resolveGroupBannerUrl,
} from "./api/groupsApi";
import { GroupDetailCard } from "./components/GroupSection";
import GroupMembersPanel from "./components/GroupMembersPanel";
import GroupContentSection from "./components/GroupContentSection";
import GroupTransfersSection from "./components/GroupTransfersSection";
import { GroupPageShell } from "./components/GroupPageShell";

const GroupDetailsPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: userInfo } = useUserInfo();

  const {
    data: group,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["cms-group", groupId],
    queryFn: () => fetchGroup(groupId!),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (searchParams.get("tab") !== "transfers") return;
    const el = document.getElementById("group-transfers");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchParams, groupId]);

  if (!groupId) return null;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-40px)] items-center justify-center text-muted-foreground">
        Loading group…
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div className="flex h-[calc(100vh-40px)] flex-col items-center justify-center gap-4">
        <p className="text-destructive">
          {getApiErrorMessage(error, "Could not load this group")}
        </p>
        <Button variant="outline" onClick={() => navigate(ROUTES.groups)}>
          Back to groups
        </Button>
      </div>
    );
  }

  const bannerUrl = resolveGroupBannerUrl(group);
  const memberCount = group.member_count ?? group.members.length;
  const myRole = getEffectiveGroupRole(group.members ?? [], userInfo);
  const canEdit = canEditGroupSettings(myRole);
  const canManageTransfers =
    canManageGroupInvites(myRole) || myRole === "OWNER";
  const readOnlyPlatform = isReviewer(userInfo?.platform_role);
  const showTransfersSection = !readOnlyPlatform;

  return (
    <GroupPageShell
      backLabel="← Groups"
      onBack={() => navigate(ROUTES.groups)}
      title={pickGroupTitle(group.metadata)}
      subtitle={
        <p className="mt-2 text-sm text-muted-foreground font-mono">
          /{group.slug}
        </p>
      }
      headerActions={
        canEdit && !readOnlyPlatform ? (
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.groupEdit(group.id)}>
              <IoMdCreate className="w-4 h-4" /> Edit
            </Link>
          </Button>
        ) : undefined
      }
    >
      <div className="px-4 sm:px-8 py-6 pb-12">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt=""
              className="w-full max-h-48 object-cover rounded-lg border"
            />
          ) : null}

          <div className="flex flex-wrap gap-4 text-sm">
            <Pecha.Badge variant="outline">
              {group.is_public ? "Public" : "Private"}
            </Pecha.Badge>
            <span className="text-muted-foreground">
              {memberCount} member{memberCount === 1 ? "" : "s"}
            </span>
            <span className="text-muted-foreground">
              {group.follower_count} follower
              {group.follower_count === 1 ? "" : "s"}
            </span>
          </div>

          {group.metadata.length > 0 && (
            <GroupDetailCard title="About">
              <div className="space-y-4">
                {group.metadata.map((meta) => (
                  <div
                    key={meta.id ?? `${meta.language}-${meta.title}`}
                    className="space-y-1"
                  >
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {languageLabelForCode(meta.language as LanguageCode)}
                    </p>
                    <p className="font-medium">{meta.title}</p>
                    {meta.sub_title?.trim() ? (
                      <p className="text-sm text-muted-foreground">
                        {meta.sub_title}
                      </p>
                    ) : null}
                    {meta.description?.trim() ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {meta.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </GroupDetailCard>
          )}

          {group.tags.length > 0 && (
            <GroupDetailCard title="Tags">
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <Pecha.Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Pecha.Badge>
                ))}
              </div>
            </GroupDetailCard>
          )}

          <div id="group-transfers">
            <GroupTransfersSection
              groupId={group.id}
              canManageIncoming={canManageTransfers && !readOnlyPlatform}
              canManageOutgoing={canManageTransfers && !readOnlyPlatform}
              alwaysVisible={showTransfersSection}
            />
          </div>

          <GroupContentSection
            groupId={group.id}
            userInfo={userInfo}
            groupRole={myRole}
            readOnlyPlatform={readOnlyPlatform}
          />

          {group.social_links.length > 0 && (
            <GroupDetailCard title="Social links">
              <ul className="space-y-2">
                {group.social_links.map((link, index) => (
                  <li key={`${link.platform}-${index}`} className="text-sm">
                    <span className="font-medium capitalize">
                      {link.platform}:
                    </span>{" "}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#A51C21] hover:underline break-all"
                    >
                      {link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </GroupDetailCard>
          )}

          <GroupMembersPanel groupId={group.id} members={group.members ?? []} />
        </div>
      </div>
    </GroupPageShell>
  );
};

export default GroupDetailsPage;
