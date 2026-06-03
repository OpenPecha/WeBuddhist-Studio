import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoMdCreate } from "react-icons/io";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { useUserInfo } from "@/hooks/useUserInfo";
import { ROUTES } from "@/routes/paths";
import {
  canEditGroupSettings,
  getEffectiveGroupRole,
} from "./lib/groupPermissions";
import type { LanguageCode } from "@/schema/SeriesSchema";
import {
  fetchGroup,
  languageLabelForCode,
  pickGroupLinkedPlanTitle,
  pickGroupLinkedSeriesTitle,
  pickGroupTitle,
  resolveGroupBannerUrl,
} from "./api/groupsApi";
import { GroupDetailCard } from "./components/GroupSection";
import GroupMembersTable from "./components/GroupMembersTable";
import { GroupPageShell } from "./components/GroupPageShell";

const GroupDetailsPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
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
        canEdit ? (
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

          {group.plans.length > 0 && (
            <GroupDetailCard title="Linked plans">
              <ul className="space-y-2">
                {group.plans.map((plan) => (
                  <li key={plan.id} className="text-sm">
                    <Link
                      to={ROUTES.plan(plan.id)}
                      className="text-[#A51C21] hover:underline font-medium"
                    >
                      {pickGroupLinkedPlanTitle(plan)}
                    </Link>
                    <span className="text-muted-foreground">
                      {" "}
                      · {languageLabelForCode(plan.language)}
                      {plan.total_days != null ? (
                        <>
                          {" "}
                          · {plan.total_days} day
                          {plan.total_days === 1 ? "" : "s"}
                        </>
                      ) : null}
                      {plan.status ? <> · {plan.status}</> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </GroupDetailCard>
          )}

          {group.series.length > 0 && (
            <GroupDetailCard title="Linked series">
              <ul className="space-y-2">
                {group.series.map((series) => (
                  <li key={series.id} className="text-sm ">
                    <Link
                      to={ROUTES.series(series.id)}
                      className="text-[#A51C21] hover:underline font-medium"
                    >
                      {pickGroupLinkedSeriesTitle(series)}
                    </Link>
                    {series.plan_count != null ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {series.plan_count} plan
                        {series.plan_count === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </GroupDetailCard>
          )}

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

          {group.members.length > 0 && (
            <GroupDetailCard title={`Members (${group.members.length})`}>
              <GroupMembersTable members={group.members} />
            </GroupDetailCard>
          )}
        </div>
      </div>
    </GroupPageShell>
  );
};

export default GroupDetailsPage;
