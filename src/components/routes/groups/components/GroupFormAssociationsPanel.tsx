import PlanTagSearchInput from "@/components/routes/create-plan/PlanTagSearchInput";
import type { TagSummaryDTO } from "../api/groupsApi";
import { mapGroupTagsToPlanTagSummaries } from "../api/groupPickerApi";
import { GroupEditableSection } from "./GroupSection";
import GroupSocialLinksEditor from "./GroupSocialLinksEditor";
import type { GroupSocialLinkDTO } from "../api/groupsApi";

type GroupFormAssociationsPanelProps = {
  tagIds: string[];
  onTagIdsChange: (ids: string[]) => void;
  initialTags: TagSummaryDTO[];
  socialLinks: GroupSocialLinkDTO[];
  onSocialLinksChange: (links: GroupSocialLinkDTO[]) => void;
  onSaveTags: () => void;
  onSaveSocial: () => void;
  tagsSaving: boolean;
  socialSaving: boolean;
  tagsSaveDisabled?: boolean;
  socialSaveDisabled?: boolean;
  readOnly?: boolean;
};

const GroupFormAssociationsPanel = ({
  tagIds,
  onTagIdsChange,
  initialTags,
  socialLinks,
  onSocialLinksChange,
  onSaveTags,
  onSaveSocial,
  tagsSaving,
  socialSaving,
  tagsSaveDisabled = false,
  socialSaveDisabled = false,
  readOnly = false,
}: GroupFormAssociationsPanelProps) => (
  <div className="w-full xl:w-1/2 xl:min-w-0 p-4 sm:p-8 pb-12 space-y-10">
    <GroupEditableSection
      title="Tags"
      onSave={onSaveTags}
      isSaving={tagsSaving}
      saveDisabled={tagsSaveDisabled}
      saveLabel="Save tags"
      savingLabel="Saving…"
      readOnly={readOnly}
    >
      <PlanTagSearchInput
        value={tagIds}
        onChange={onTagIdsChange}
        hideLabel
        initialTags={mapGroupTagsToPlanTagSummaries(initialTags)}
      />
    </GroupEditableSection>

    <GroupEditableSection
      title="Social links"
      onSave={onSaveSocial}
      isSaving={socialSaving}
      saveDisabled={socialSaveDisabled}
      saveLabel="Save links"
      savingLabel="Saving…"
      readOnly={readOnly}
    >
      <GroupSocialLinksEditor
        value={socialLinks}
        onChange={onSocialLinksChange}
        hideLabel
      />
    </GroupEditableSection>
  </div>
);

export default GroupFormAssociationsPanel;
