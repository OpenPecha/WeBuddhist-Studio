import { IoEyeOffSharp } from "react-icons/io5";
import {
  isGroupVisibleInApp,
  type AuthorGroupDetailDTO,
} from "../api/groupsApi";
import GroupPublishControl from "./GroupPublishControl";

type GroupDraftBannerProps = {
  group: AuthorGroupDetailDTO;
  canPublish: boolean;
};

const GroupDraftBanner = ({ group, canPublish }: GroupDraftBannerProps) => {
  if (isGroupVisibleInApp(group.status) || !group.status) return null;

  const isDraft = group.status === "DRAFT";

  return (
    <div className="flex flex-wrap items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-950/40">
      <IoEyeOffSharp
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300"
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
          {isDraft
            ? "This group is a draft — it isn't visible in the app yet."
            : "This group is hidden — it isn't visible in the app."}
        </p>
        <p className="text-sm text-amber-800 dark:text-amber-200/90">
          {canPublish
            ? "Publish it when you're ready for people to find and join it."
            : "An owner or admin can publish it when it's ready."}
        </p>
      </div>
      {canPublish ? (
        <GroupPublishControl
          group={group}
          variant="default"
          className="shrink-0"
        />
      ) : null}
    </div>
  );
};

export default GroupDraftBanner;
